const _ = require("lodash");
const puppeteer = require("puppeteer");
const moment = require("moment");
const notifier = require("node-notifier");
const mailer = require("nodemailer");
const fs = require("fs");

const CAS_URL = "https://sso.hcmut.edu.vn/cas/login?service=http%3A%2F%2Fmybk.hcmut.edu.vn%2Fstinfo%2F";
const INFO_URL = "https://mybk.hcmut.edu.vn/stinfo/";
const GRADES_FILE = "grades.json";

const { username, password, semester, interval,
  notify, useEmail, email, emailPassword } = require("./config");

let browser = null;
let page = null;

let currentGrades = null;

if (fs.existsSync(GRADES_FILE)) {
  currentGrades = JSON.parse(fs.readFileSync(GRADES_FILE));
}

const login = async page => {
  await page.goto(CAS_URL);
  if (page.url() === INFO_URL) return;
  await page.type("#username", username);
  await page.type("#password", password);
  await page.click("input[type='submit']");
  await page.waitFor(5000);
  if (page.url() !== INFO_URL) {
    throw Error("Login failed");
  }
};

const processRawGrades = rawGrades => {
  const processGrades = rawGrades.map(rawGrade => _.pick(rawGrade,
    ["ma_mh", "ten_mh", "nhomto", "diem_ktra", "diem_thi", "diem_tong_ket", "diem_thanhphan"])
  );
  return _.keyBy(processGrades, 'ma_mh');
}

const updateGrades = (currentGrades, latestGrades) => {
  let updatedSubjects = [];
  for (const subject in latestGrades) {
    const subjectCurrentGrades = currentGrades[subject];
    const subjectLatestGrades = latestGrades[subject];
    if (!_.isEqual(subjectCurrentGrades, subjectLatestGrades)) {
      currentGrades[subject] = subjectLatestGrades;
      updatedSubjects.push(subjectLatestGrades);
    }
  }
  return updatedSubjects;
}

const handleResponse = async response => {
  if (response.url().endsWith("/ajax_grade")) {
    try {
      const data = await response.json();
      const semesterData = data[semester];

      let latestGrades = null;
      if (_.isNil(semesterData)) {
        throw Error(`Semester ${semester} not found`);
      } else {
        latestGrades = processRawGrades(semesterData["diem"]);
      }

      if (currentGrades === null) {
        currentGrades = latestGrades;
        console.log("Current grades:")
        console.table(currentGrades);
        fs.writeFileSync(GRADES_FILE, JSON.stringify(currentGrades, null, 2));
      } else {
        const updatedSubjects = updateGrades(currentGrades, latestGrades);
        if (updatedSubjects.length > 0) {
          console.log("Grades updated!")
          console.table(currentGrades);
          fs.writeFileSync(GRADES_FILE, JSON.stringify(currentGrades, null, 2));

          if (notify) {
            updatedSubjects.forEach(subject => {
              notifier.notify({
                title: "New grade",
                message: `${subject.ten_mh} (${subject.ma_mh})`
              });
            });
          }

          if (useEmail) {
            const transporter = mailer.createTransport({
              service: "gmail",
              auth: {
                user: email,
                pass: emailPassword
              }
            });

            const mailOptions = {
              from: email,
              to: email,
              subject: "New grades",
              html: updatedSubjects.map(subject => `<p>${subject.ten_mh} (${subject.ma_mh})</p>`).join()
            };

            transporter.sendMail(mailOptions, (err, info) => {
              if (err) throw err;
              else console.log("Email sent!");
            });
          }
        } else {
          console.log("No new grades");
        }
      }
    } catch (e) {
      console.log("Error:", e.message);
    } finally {
      setTimeout(checkGrades, interval * 1000 * 60);
      page.close();
    }
  }
};

const checkGrades = async () => {
  try {
    page = await browser.newPage();
    page.on("response", handleResponse);

    console.log("====================");
    console.log("Time:", moment().format("DD/MM/YYYY HH:mm:ss"));
    console.log("Logging in...");
    await login(page);
    console.log("Getting grades...")
    await page.evaluate(() => {
      document.querySelector("a[data-link='grade']").click();
    });
  } catch (e) {
    console.log("Error:", e.message);
    setTimeout(checkGrades, interval * 1000 * 60);
    page.close();
  }
}

(async () => {
  browser = await puppeteer.launch({ headless: true });
  checkGrades();
})();
