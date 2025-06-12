import { api } from "../api/api";

export interface EmailMetrics {
  total_scheduled: number;
  total_pending: number;
  total_sent: number;
  status_breakdown: {
    pending: number;
    sent: number;
    error: number;
  };
  daily_stats: Array<{
    date: string;
    count: number;
  }>;
  peak_hours: Array<{
    hour: number;
    count: number;
  }>;
  unique_recipients: number;
  top_recipients: Array<{
    client_id: number;
    client_name: string;
    email_count: number;
  }>;
  popular_schedules: Array<{
    schedule_id: number;
    client_count: number;
  }>;
}

export interface SmsMetrics {
  total_scheduled: number;
  status_breakdown: {
    pending: number;
    sent: number;
    error: number;
  };
  future_schedules: Array<{
    date: string;
    count: number;
  }>;
  messages_with_files: number;
  messages_by_user: Array<{
    user_id: number;
    user_name: string;
    message_count: number;
  }>;
}

export interface WhatsAppMetrics {
  total_messages: number;
  status_breakdown: {
    pending: number;
    sent: number;
    failed: number;
  };
  type_breakdown: {
    text: number;
    image: number;
    video: number;
    audio: number;
    document: number;
    other: number;
  };
  messages_with_media: number;
  instance_breakdown: Array<{
    instance_id: string;
    instance_name: string;
    message_count: number;
  }>;
  messages_by_user: Array<{
    user_id: number;
    user_name: string;
    message_count: number;
  }>;
}

export interface MetricsSummary {
  email_metrics: EmailMetrics;
  sms_metrics: SmsMetrics;
  whatsapp_metrics: WhatsAppMetrics;
}

// Mock data for testing
const mockMetrics: MetricsSummary = {
  email_metrics: {
    total_scheduled: 250,
    total_pending: 50,
    total_sent: 200,
    status_breakdown: {
      pending: 50,
      sent: 180,
      error: 20
    },
    daily_stats: [
      { date: "2024-03-20", count: 45 },
      { date: "2024-03-21", count: 38 },
      { date: "2024-03-22", count: 52 }
    ],
    peak_hours: [
      { hour: 9, count: 25 },
      { hour: 14, count: 30 },
      { hour: 16, count: 28 }
    ],
    unique_recipients: 150,
    top_recipients: [
      { client_id: 1, client_name: "Client A", email_count: 15 },
      { client_id: 2, client_name: "Client B", email_count: 12 },
      { client_id: 3, client_name: "Client C", email_count: 10 }
    ],
    popular_schedules: [
      { schedule_id: 1, client_count: 50 },
      { schedule_id: 2, client_count: 35 },
      { schedule_id: 3, client_count: 30 }
    ]
  },
  sms_metrics: {
    total_scheduled: 180,
    status_breakdown: {
      pending: 30,
      sent: 140,
      error: 10
    },
    future_schedules: [
      { date: "2024-03-23", count: 15 },
      { date: "2024-03-24", count: 20 },
      { date: "2024-03-25", count: 18 }
    ],
    messages_with_files: 45,
    messages_by_user: [
      { user_id: 1, user_name: "User A", message_count: 50 },
      { user_id: 2, user_name: "User B", message_count: 40 },
      { user_id: 3, user_name: "User C", message_count: 35 }
    ]
  },
  whatsapp_metrics: {
    total_messages: 320,
    status_breakdown: {
      pending: 40,
      sent: 260,
      failed: 20
    },
    type_breakdown: {
      text: 180,
      image: 60,
      video: 30,
      audio: 20,
      document: 25,
      other: 5
    },
    messages_with_media: 135,
    instance_breakdown: [
      { instance_id: "inst1", instance_name: "Vendas", message_count: 150 },
      { instance_id: "inst2", instance_name: "Suporte", message_count: 100 },
      { instance_id: "inst3", instance_name: "Marketing", message_count: 70 }
    ],
    messages_by_user: [
      { user_id: 1, user_name: "João Silva", message_count: 120 },
      { user_id: 2, user_name: "Maria Santos", message_count: 100 },
      { user_id: 3, user_name: "Pedro Oliveira", message_count: 80 }
    ]
  }
};

export const getMetricsSummary = async (): Promise<MetricsSummary> => {
  try {
    const response = await api.get<MetricsSummary>("/metrics/summary");
    return response.data;
  } catch (error) {
    console.log("Using mock metrics data:", error);
    return mockMetrics;
  }
}; 