class CourierAdapter {
  constructor() {
    this.supportsCod = true; // Default capability
  }
  async checkServiceability(pincode) { throw new Error("Not implemented"); }
  async createShipment(orderDetails) { throw new Error("Not implemented"); }
}

class DelhiveryAdapter extends CourierAdapter {
  constructor() {
    super();
    this.supportsCod = true;
  }
  async checkServiceability(pincode) {
    if (pincode === '793001') return { serviceable: false };
    return { serviceable: true, estimated_days_min: 3 };
  }
  async createShipment(orderDetails) {
    return { awbNumber: `DEL_${Date.now()}`, courierCode: "delhivery" };
  }
}

class ShiprocketAdapter extends CourierAdapter {
  constructor() {
    super();
    this.supportsCod = true;
  }
  async checkServiceability(pincode) {
    if (pincode === '793001') return { serviceable: true, estimated_days_min: 6 };
    return { serviceable: true, estimated_days_min: 4 };
  }
  async createShipment(orderDetails) {
    return { awbNumber: `SR_${Date.now()}`, courierCode: "shiprocket" };
  }
}

class BluedartAdapter extends CourierAdapter {
  constructor() {
    super();
    this.supportsCod = false; // ISP: Bluedart doesn't support COD in our config
  }
  async checkServiceability(pincode) {
    const tier1Pincodes = ['400001', '110001'];
    if (!tier1Pincodes.includes(pincode)) return { serviceable: false };
    return { serviceable: true, estimated_days_min: 1 };
  }
  async createShipment(orderDetails) {
    return { awbNumber: `BD_${Date.now()}`, courierCode: "bluedart" };
  }
}

class LogisticsEngine {
  constructor() {
    this.registry = new Map();
  }

  registerCourier(courierCode, adapterInstance) {
    if (!(adapterInstance instanceof CourierAdapter)) {
      throw new Error("Adapter must extend CourierAdapter");
    }
    this.registry.set(courierCode, adapterInstance);
  }

  _getPriorityOrder(orderValue, isCod) {
    if (orderValue > 5000 && !isCod && this.registry.has("bluedart")) {
      return ["bluedart", "delhivery", "shiprocket"];
    }
    return ["delhivery", "shiprocket", "bluedart"];
  }

  async checkPincodeServiceability(pincode, isCod, orderValue) {
    const priorityOrder = this._getPriorityOrder(orderValue, isCod);
    
    for (const courierCode of priorityOrder) {
      const adapter = this.registry.get(courierCode);
      if (!adapter) continue;

      if (isCod && !adapter.supportsCod) {
        continue;
      }

      const result = await adapter.checkServiceability(pincode);
      
      if (result.serviceable) {
        return { courierCode, ...result };
      }
    }
    
    return { serviceable: false, courierCode: null };
  }
}

const logisticsEngine = new LogisticsEngine();
logisticsEngine.registerCourier("delhivery", new DelhiveryAdapter());
logisticsEngine.registerCourier("shiprocket", new ShiprocketAdapter());
logisticsEngine.registerCourier("bluedart", new BluedartAdapter());

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function estimateDeliveryDate({ pincodeTier, courierCode, isCod }) {
  const baseEstimates = {
    1: { min: 1, max: 3 },
    2: { min: 3, max: 6 },
    3: { min: 5, max: 10 },
  };
  const estimate = baseEstimates[pincodeTier] || baseEstimates[3];
  const codBuffer = isCod ? 1 : 0;
  const today = new Date();
  return {
    minDate: addDays(today, estimate.min + codBuffer),
    maxDate: addDays(today, estimate.max + codBuffer),
  };
}

module.exports = {
  logisticsEngine,
  estimateDeliveryDate
};
