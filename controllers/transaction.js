module.exports.getTransaction = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Transaction route is working!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
