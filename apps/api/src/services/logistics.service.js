const logisticsEngine = {
  checkPincodeServiceability: async (pincode, isCod, orderValue) => {
    if (orderValue > 5000 && !isCod && ['400001', '110001'].includes(pincode)) {
      return { serviceable: true, estimated_days_min: 1, courierCode: 'bluedart' };
    }
    if (pincode !== '793001') {
      return { serviceable: true, estimated_days_min: 3, courierCode: 'delhivery' };
    }
    return { serviceable: true, estimated_days_min: 6, courierCode: 'shiprocket' };
  }
};

function estimateDeliveryDate({ pincodeTier, courierCode, isCod }) {
  const baseEstimates = {
    1: { min: 1, max: 3 },
    2: { min: 3, max: 6 },
    3: { min: 5, max: 10 }
  };
  const estimate = baseEstimates[pincodeTier] || baseEstimates[3];
  const codBuffer = isCod ? 1 : 0;
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + estimate.min + codBuffer);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + estimate.max + codBuffer);

  return {
    minDate,
    maxDate
  };
}

module.exports = {
  logisticsEngine,
  estimateDeliveryDate
};
