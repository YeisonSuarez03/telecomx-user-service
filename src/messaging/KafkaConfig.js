import dotenv from 'dotenv';
dotenv.config();

class KafkaConfig {
  constructor() {
    if (KafkaConfig.instance) return KafkaConfig.instance;
    this.broker = process.env.BROKER || 'kafka.railway.internal:29092';
    this.topic = process.env.EVENTS_TOPIC || 'Customer';
    KafkaConfig.instance = this;
  }

  getBroker() {
    return this.broker;
  }

  getTopic() {
    return this.topic;
  }
}

export default new KafkaConfig();
