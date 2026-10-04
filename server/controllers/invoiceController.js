const path = require('path');
const fs = require('fs');

const INVOICE_SETTINGS_PATH = path.join(__dirname, '..', 'invoice-settings.json');
const defaultInvoiceSettings = {
  companyName: "DHARTI INDUSTRIES",
  addressLine1: "S.NO. 85P2, NEAR SIDDHESHWAR SOCIETY, OPP. UNIQUE SCHOOL, OPP. KALPVAN,",
  addressLine2: "KORAT CHOWK, GONDAL NATIONAL HIGHWAY, PARDI, RAJKOT - 360024",
  gstin: "24ESVPK3884F1Z5",
  bankName: "BANK OF BARODA",
  accountNo: "38720200000268",
  ifscCode: "BARB0PARDIR",
  terms1: "1. Our risk and responsibility ceases as soon as the goods leave our premises.",
  terms2: "2. Interest @18% p.a. will be charged if payment is not made within due date.",
  terms3: "3. Goods once sold will not be taken back.",
  terms4: "4. \"Subject to 'RAJKOT' Jurisdiction only. E.&.O.E\""
};

// GET invoice settings (admin)
const getInvoiceSettings = (req, res) => {
  try {
    if (fs.existsSync(INVOICE_SETTINGS_PATH)) {
      const data = fs.readFileSync(INVOICE_SETTINGS_PATH, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json(defaultInvoiceSettings);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST update invoice settings (admin)
const updateInvoiceSettings = (req, res) => {
  try {
    const newSettings = req.body;
    fs.writeFileSync(INVOICE_SETTINGS_PATH, JSON.stringify(newSettings, null, 2), 'utf-8');
    res.json({ message: 'Invoice settings updated successfully.', settings: newSettings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getInvoiceSettings, updateInvoiceSettings };
