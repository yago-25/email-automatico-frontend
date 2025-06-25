import { FaEnvelope, FaUsers, FaWhatsapp, FaHourglassHalf } from "react-icons/fa";
import { MdSms, MdAttachFile } from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";
import { BsCheckCircleFill } from "react-icons/bs";
import { HiDocumentText } from "react-icons/hi";
import { RiMessage2Fill } from "react-icons/ri";
import Spin from "../../components/Spin/Spin";
import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from "recharts";
import { useEffect, useState } from "react";
import { MetricsSummary, getMetricsSummary } from "../../services/metricsService";
import useSwr from "swr";
import { api } from "../../api/api";
import { useParams } from "react-router-dom";
import { User } from "../../models/User";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header/Header";

interface EmailClient {
  id: number;
  name: string;
  mail: string;
}
interface EmailItem {
  id: number;
  subject: string;
  body: string;
  send_date: string;
  send_time: string;
  status: string;
  clients: EmailClient[];
  attachments: Attachment[];
}

interface Attachment {
  name: string;
  url: string;
}
interface Sms {
  id: number;
  user_name: string;
  names: string[];
  phones: string[];
  message: string;
  scheduled_at: string;
  file_path: string | null;
  status: string;
}
type WppScheduleData = {
  id: number;
  instance_id: string;
  name: string;
  phone: string;
  message: string;
  user_id: number;
  user_name: string;
  status: "sent" | "failed" | "pending";
  scheduled_at: string;
  file_path?: string;
};

interface Client {
  id: number;
  name: string;
  phone: string;
  mail: string;
}
interface Ticket {
  id: number;
  name: string;
  type: string;
  status: string;
  tags: string[] | string;
  client: {
    id: number;
    name: string;
  };
  user: User;
  create: User;
  message: string;
  created_at: string;
  observation?: string;
  histories?: TicketHistory[];
}
interface TicketHistory {
  id: number;
  ticket_id: number;
  user_id: number;
  field_modified: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

const Metrics = () => {
  const { t } = useTranslation();
  const [, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const { instance } = useParams<{ instance: string }>();
  const [openCharts, setOpenCharts] = useState({
    tickets: false,
    emails: false,
    sms: false,
    whatsapp: false
  });

  const [openMetrics, setOpenMetrics] = useState({
    clients: false,
    tickets: false,
    emails: false,
    sms: false,
    whatsapp: false
  });

  const { data: mails = [] } = useSwr<EmailItem[]>("/emails", () =>
    api.get("/emails", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then(res => res.data)
  );

  const { data: sms = [] } = useSwr<Sms[]>("/sms", () =>
    api.get("/sms", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then(res => res.data)
  );



  const {
    data: wppMessages = [],
  } = useSwr<WppScheduleData[]>(`/wpp?instance_id=${instance}`, () =>
    api.get("/wpp?instance_id=${instance}", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then(res => res.data)
  );

  const {
    data: clients = [],
  } = useSwr<Client[]>("/clients", {
    fetcher: (url) =>
      api
        .get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((res) => res.data),
  });

  const {
    data: rawTickets = [],
  } = useSwr<Ticket[]>("/tickets", {
    fetcher: (url) =>
      api
        .get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((res) => res.data),
  });

  const totalTickets = rawTickets.length;

  const notStartedTickets = rawTickets.filter(ticket => ticket.status === "Não iniciada").length;
  const openTickets = rawTickets.filter(ticket => ticket.status === "Esperando").length;
  const inProgressTickets = rawTickets.filter(ticket => ticket.status === "Em progresso").length;
  const completedTickets = rawTickets.filter(ticket => ticket.status === "Completo").length;
  const discardedTickets = rawTickets.filter(ticket => ticket.status === "Descartada").length;

  const ticketStatusData = [
    { name: t('ticketsStatus.notStarted'), value: notStartedTickets },
    { name: t('ticketsStatus.open'), value: openTickets },
    { name: t('ticketsStatus.inProgress'), value: inProgressTickets },
    { name: t('ticketsStatus.completed'), value: completedTickets },
    { name: t('ticketsStatus.discarded'), value: discardedTickets }
  ];


  const totalClients = clients.length;
  const clientsWithPhone = clients.filter(client => !!client.phone).length;
  const clientsWithEmail = clients.filter(client => !!client.mail).length;

  const totalEmails = mails.length;
  const sentEmails = mails.filter(mail => mail.status === "sent").length;
  const pendingEmails = mails.filter(mail => mail.status === "pending").length;
  const failedEmails = mails.filter(mail => mail.status === "failed").length;
  const emailDeliveryRate = totalEmails > 0 ? Math.round((sentEmails / totalEmails) * 100) : 0;

  const emailStatusData = [
    { name: t('emailStatus.sent'), value: sentEmails },
    { name: t('emailStatus.pending'), value: pendingEmails },
    { name: t('emailStatus.failed'), value: failedEmails }
  ];


  const totalSMS = sms.length;
  const sentSMS = sms.filter(item => item.status === "sent").length;
  const pendingSMS = sms.filter(item => item.status === "pending").length;
  const failedSMS = sms.filter(item => item.status === "failed").length;
  const smsDeliveryRate = totalSMS > 0 ? Math.round((sentSMS / totalSMS) * 100) : 0;

  const smsStatusData = [
    { name: t('smsStatus.sent'), value: sentSMS },
    { name: t('smsStatus.pending'), value: pendingSMS },
    { name: t('smsStatus.failed'), value: failedSMS }
  ];

  const totalMessages = wppMessages.length;
  const mediaMessages = wppMessages.filter(msg => msg.file_path).length;
  const deliveredMessages = wppMessages.filter(msg => msg.status === "sent").length;
  const textMessages = wppMessages.filter(msg => msg.message === "text").length;
  const deliveryRate = totalMessages > 0 ? Math.round((deliveredMessages / totalMessages) * 100) : 0;

  const whatsappStatusData = [
    { name: t('whatsappStatus.sent'), value: wppMessages.filter(msg => msg.status === "sent").length },
    { name: t('whatsappStatus.pending'), value: wppMessages.filter(msg => msg.status === "pending").length },
    { name: t('whatsappStatus.failed'), value: wppMessages.filter(msg => msg.status === "failed").length }
  ];


  const toggleChart = (chartName: keyof typeof openCharts) => {
    setOpenCharts(prev => ({
      ...prev,
      [chartName]: !prev[chartName]
    }));
  };

  const toggleMetrics = (metricName: keyof typeof openMetrics) => {
    setOpenMetrics(prev => ({
      ...prev,
      [metricName]: !prev[metricName]
    }));
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetricsSummary();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: IconComponent,
    color,
    subtitle = null,
    trend = null
  }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    subtitle?: string | null;
    trend?: { value: number; isPositive: boolean } | null;
  }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
          <IconComponent className="w-6 h-6" style={{ color: color }} />
        </div>
        {trend && (
          <div className={`flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span className="text-sm font-medium">
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  }

  return (
    <>
      <Header name={authUser?.nome_completo} />
      <div className="flex min-h-screen from-gray-900 to-gray-800">
        <div className="fixed w-72 h-screen bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <IoStatsChart className="text-blue-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {t('metrics.systemMetrics')}
            </h2>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {t('metrics.title')}
            </h3>

            <button
              onClick={() => toggleMetrics('clients')}
              className="w-full px-4 py-3 bg-purple-500/10 text-purple-300 rounded-xl hover:bg-purple-500/20 transition-all duration-300 flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30">
                <FaUsers className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {openMetrics.clients ? t('metrics.closeClients') : t('metrics.openClients')}
              </span>
            </button>

            <button
              onClick={() => toggleMetrics('tickets')}
              className="w-full px-4 py-3 bg-blue-500/10 text-blue-300 rounded-xl hover:bg-blue-500/20 transition-all duration-300 flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30">
                <FaEnvelope className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {openMetrics.tickets ? t('metrics.closeTickets') : t('metrics.openTickets')}
              </span>
            </button>

            <button
              onClick={() => toggleMetrics('emails')}
              className="w-full px-4 py-3 bg-green-500/10 text-green-300 rounded-xl hover:bg-green-500/20 transition-all duration-300 flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30">
                <FaEnvelope className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {openMetrics.emails ? t('metrics.closeEmails') : t('metrics.openEmails')}
              </span>
            </button>

            <button
              onClick={() => toggleMetrics('sms')}
              className="w-full px-4 py-3 bg-teal-500/10 text-teal-300 rounded-xl hover:bg-teal-500/20 transition-all duration-300 flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-teal-500/20 group-hover:bg-teal-500/30">
                <MdSms className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {openMetrics.sms ? t('metrics.closeSms') : t('metrics.openSms')}
              </span>
            </button>

            <button
              onClick={() => toggleMetrics('whatsapp')}
              className="w-full px-4 py-3 bg-emerald-500/10 text-emerald-300 rounded-xl hover:bg-emerald-500/20 transition-all duration-300 flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30">
                <FaWhatsapp className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {openMetrics.whatsapp ? t('metrics.closeWhatsapp') : t('metrics.openWhatsapp')}
              </span>
            </button>
          </div>

          <div className="border-t border-gray-700/50 my-6"></div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {t('metrics.charts')}
            </h3>
            <button
              onClick={() => toggleChart('tickets')}
              className="w-full px-4 py-3 bg-indigo-500/10 text-indigo-300 rounded-xl hover:bg-indigo-500/20 transition-all duration-300 flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30">
                <IoStatsChart className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {openCharts.tickets ? t('metrics.closeTicketChart') : t('metrics.openTicketChart')}
              </span>
            </button>


            <button
              onClick={() => toggleChart('emails')}
              className="w-full px-4 py-3 bg-blue-500/10 text-blue-300 rounded-xl hover:bg-blue-500/20 transition-all duration-300 flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30">
                <IoStatsChart className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {openCharts.emails ? t('metrics.closeEmailChart') : t('metrics.openEmailChart')}
              </span>
            </button>

            <button
              onClick={() => toggleChart('sms')}
              className="w-full px-4 py-3 bg-teal-500/10 text-teal-300 rounded-xl hover:bg-teal-500/20 transition-all duration-300 flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-teal-500/20 group-hover:bg-teal-500/30">
                <IoStatsChart className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {openCharts.sms ? t('metrics.closeSmsChart') : t('metrics.openSmsChart')}
              </span>
            </button>

            <button
              onClick={() => toggleChart('whatsapp')}
              className="w-full px-4 py-3 bg-emerald-500/10 text-emerald-300 rounded-xl hover:bg-emerald-500/20 transition-all duration-300 flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30">
                <IoStatsChart className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {openCharts.whatsapp ? t('metrics.closeWhatsappChart') : t('metrics.openWhatsappChart')}
              </span>
            </button>
          </div>
        </div>
        <div className="flex-1 ml-72 p-8 overflow-y-auto">
          <div className="space-y-8">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <FaUsers className="text-purple-400 w-5 h-5" />
                </div>
                {t('clientMetrics.title')}
              </h2>

              {openMetrics.clients && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title={t('clientMetrics.total')}
                    value={totalClients.toString()}
                    icon={FaUsers}
                    color="#8B5CF6"
                  />
                  <StatCard
                    title={t('clientMetrics.withPhone')}
                    value={clientsWithPhone.toString()}
                    icon={BsCheckCircleFill}
                    color="#10B981"
                  />
                  <StatCard
                    title={t('clientMetrics.withEmail')}
                    value={clientsWithEmail.toString()}
                    icon={IoStatsChart}
                    color="#3B82F6"
                  />
                </div>
              )}

            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <FaEnvelope className="text-blue-400 w-5 h-5" />
                </div>
                {t('ticketMetrics.title')}
              </h2>


              {openMetrics.tickets && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title={t('ticketsStats.total')}
                    value={totalTickets.toString()}
                    icon={FaEnvelope}
                    color="#3B82F6"
                  />
                  <StatCard
                    title={t('ticketsStats.open')}
                    value={openTickets.toString()}
                    icon={BsCheckCircleFill}
                    color="#10B981"
                  />
                  <StatCard
                    title={t('ticketsStats.inProgress')}
                    value={inProgressTickets.toString()}
                    icon={IoStatsChart}
                    color="#F59E0B"
                  />
                  <StatCard
                    title={t('ticketsStats.notStarted')}
                    value={notStartedTickets.toString()}
                    icon={FaHourglassHalf}
                    color="#8B5CF6"
                  />
                  <StatCard
                    title={t('ticketsStats.discarded')}
                    value={discardedTickets.toString()}
                    icon={FaHourglassHalf}
                    color="#8B5CF6"
                  />
                  <StatCard
                    title={t('ticketsStats.completed')}
                    value={completedTickets.toString()}
                    icon={FaHourglassHalf}
                    color="#8B5CF6"
                  />

                </div>
              )}

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20">
                    <IoStatsChart className="text-indigo-400 w-5 h-5" />
                  </div>
                     {t('ticketCharts.statusDistribution')} 
                </h3>
                {openCharts.tickets && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ticketStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ticketStatusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1f2937'
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            color: '#1f2937',
                            paddingTop: '20px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/20">
                  <FaEnvelope className="text-green-400 w-5 h-5" />
                </div>
                {t('emailMetrics.title')}
              </h2>

              {openMetrics.emails && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title={t('emailMetrics.total')}
                    value={totalEmails.toString()}
                    icon={FaEnvelope}
                    color="#10B981"
                  />
                  <StatCard
                    title={t('emailMetrics.sent')}
                    value={sentEmails.toString()}
                    icon={BsCheckCircleFill}
                    color="#3B82F6"
                  />
                  <StatCard
                    title={t('emailMetrics.pending')}
                    value={pendingEmails.toString()}
                    icon={FaHourglassHalf}
                    color="#F59E0B"
                  />
                  <StatCard
                    title={t('emailMetrics.deliveryRate')}
                    value={`${emailDeliveryRate}%`}
                    icon={IoStatsChart}
                    color="#8B5CF6"
                  />
                </div>
              )}

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/20">
                    <IoStatsChart className="text-blue-400 w-5 h-5" />
                  </div>
                  {t('emailCharts.statusDistribution')} 
                </h3>

                {openCharts.emails && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={emailStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {emailStatusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1f2937'
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            color: '#1f2937',
                            paddingTop: '20px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/20">
                  <MdSms className="text-teal-400 w-5 h-5" />
                </div>
                {t('smsMetrics.title')}
              </h2>

              {openMetrics.sms && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title={t('smsMetrics.total')}
                    value={totalSMS.toString()}
                    icon={MdSms}
                    color="#10B981"
                  />
                  <StatCard
                    title={t('smsMetrics.sent')}
                    value={sentSMS.toString()}
                    icon={BsCheckCircleFill}
                    color="#3B82F6"
                  />
                  <StatCard
                    title={t('smsMetrics.pending')}
                    value={pendingSMS.toString()}
                    icon={FaHourglassHalf}
                    color="#F59E0B"
                  />
                  <StatCard
                    title={t('smsMetrics.deliveryRate')}
                    value={`${smsDeliveryRate}%`}
                    icon={IoStatsChart}
                    color="#8B5CF6"
                  />
                </div>
              )}

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-500/20">
                    <IoStatsChart className="text-teal-400 w-5 h-5" />
                  </div>
                  {t('smsStatusDistribution.title')}
                </h3>
                {openCharts.sms && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={smsStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {smsStatusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1f2937'
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            color: '#1f2937',
                            paddingTop: '20px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <FaWhatsapp className="text-emerald-400 w-5 h-5" />
                </div>
                {t('whatsappMetrics.title')}
              </h2>

              {openMetrics.whatsapp && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title={t('whatsappMetrics.totalMessages')}
                    value={totalMessages.toString()}
                    icon={RiMessage2Fill}
                    color="#10B981"
                  />
                  <StatCard
                    title={t('whatsappMetrics.mediaMessages')}
                    value={mediaMessages.toString()}
                    icon={MdAttachFile}
                    color="#3B82F6"
                  />
                  <StatCard
                    title={t('whatsappMetrics.deliveryRate')}
                    value={`${deliveryRate}%`}
                    icon={BsCheckCircleFill}
                    color="#8B5CF6"
                  />
                  <StatCard
                    title={t('whatsappMetrics.textMessages')}
                    value={textMessages.toString()}
                    icon={HiDocumentText}
                    color="#F59E0B"
                  />
                </div>
              )}

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20">
                    <IoStatsChart className="text-emerald-400 w-5 h-5" />
                  </div>
                  {t('whatsappStatusDistribution.title')}
                </h3>

                {openCharts.whatsapp && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={whatsappStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {whatsappStatusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1f2937'
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            color: '#1f2937',
                            paddingTop: '20px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Metrics;