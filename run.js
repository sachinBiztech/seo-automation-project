const fs = require("fs");
const PDFDocument = require("pdfkit");

// STEP 1: Read data
const data = JSON.parse(
  fs.readFileSync("../mock-data/ga4-mock.json", "utf-8")
);

// STEP 2: Build report
const report = {
  report_id: "report-" + Date.now(),
  summary: {
    total_sessions: data.windows["15_day"].total_sessions,
    organic_sessions: data.windows["15_day"].organic_sessions,
    conversions: data.windows["15_day"].conversions
  },
  insights: [],
  recommendations: []
};

if (report.summary.conversions < 20) {
  report.insights.push("Low conversions detected");
  report.recommendations.push("Improve landing page and CTA");
}

// STEP 3: Save JSON
const jsonPath = "../outputs/report-summary.json";
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

console.log("✅ JSON saved");

// STEP 4: Create PDF
const pdfPath = "../outputs/report.pdf";

const doc = new PDFDocument();
const stream = fs.createWriteStream(pdfPath);

doc.pipe(stream);

doc.fontSize(18).text("SEO Intelligence Report");

doc.moveDown();
doc.fontSize(12).text(`Sessions: ${report.summary.total_sessions}`);
doc.text(`Organic: ${report.summary.organic_sessions}`);
doc.text(`Conversions: ${report.summary.conversions}`);

doc.moveDown();
doc.text("Insights:");
report.insights.forEach(i => doc.text("- " + i));

doc.moveDown();
doc.text("Recommendations:");
report.recommendations.forEach(r => doc.text("- " + r));

doc.end();

stream.on("finish", () => {
  console.log("✅ PDF created");
});