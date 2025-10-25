import { FaEnvelope, FaUsers, FaWhatsapp, FaHourglassHalf } from "react-icons/fa";
import { MdSms, MdAttachFile } from "react-icons/md";
import { IoStatsChart, IoTicketSharp } from "react-icons/io5";
import { BsCheckCircleFill } from "react-icons/bs";
import { HiDocumentText } from "react-icons/hi";
import { RiMessage2Fill } from "react-icons/ri";
import Spin from "../../components/Spin/Spin";
import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from "recharts";
import { useState } from "react";
// import { getMetricsSummary } from "../../services/metricsService";
import useSwr from "swr";
import { api } from "../../api/api";
import { useParams } from "react-router-dom";
import { User } from "../../models/User";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header/Header";


type MetricsSummary = {
  emails: {
    totalEmails: number;
    sentEmails: number;
    pendingEmails: number;
    failedEmails: number;
  };
  sms: {
    totalSMS: number;
    sentSMS: number;
    pendingSMS: number;
    failedSMS: number;
  };
  whatsapp: {
    totalWpp: number;
    deliveredWpp: number;
    pendingWpp: number;
    failedWpp: number;
    mediaWpp: number;
    textWpp: number;
  };
  clients: {
    totalClients: number;
    clientsWithPhone: number;
    clientsWithEmail: number;
  };
  tickets: {
    totalTickets: number;
    notStarted: number;
    open: number;
    inProgress: number;
    completed: number;
    discarded: number;
  };
};


const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

const Metrics = () => {
  const { t } = useTranslation();
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

  const apiUrl = instance
  ? `/metrics-summary?instance_id=${instance}`
  : `/metrics-summary`;

const { data: metrics, isLoading } = useSwr<MetricsSummary>(
  apiUrl,
  () =>
    api.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then((res) => res.data)
);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  }

  const {
    emails,
    sms,
    whatsapp,
    clients,
    tickets,
  } = metrics!; 

  const emailStatusData = [
    { name: t('emailStatus.sent'), value: emails.sentEmails },
    { name: t('emailStatus.pending'), value: emails.pendingEmails },
    { name: t('emailStatus.failed'), value: emails.failedEmails },
  ];

  const smsStatusData = [
    { name: t('smsStatus.sent'), value: sms.sentSMS },
    { name: t('smsStatus.pending'), value: sms.pendingSMS },
    { name: t('smsStatus.failed'), value: sms.failedSMS },
  ];

  const whatsappStatusData = [
    { name: t('whatsappStatus.sent'), value: whatsapp.deliveredWpp },
    { name: t('whatsappStatus.pending'), value: whatsapp.pendingWpp },
    { name: t('whatsappStatus.failed'), value: whatsapp.failedWpp },
  ];

  const ticketStatusData = [
    { name: t('ticketsStatus.notStarted'), value: tickets.notStarted },
    { name: t('ticketsStatus.open'), value: tickets.open },
    { name: t('ticketsStatus.inProgress'), value: tickets.inProgress },
    { name: t('ticketsStatus.completed'), value: tickets.completed },
    { name: t('ticketsStatus.discarded'), value: tickets.discarded },
  ];

  const {
    totalClients,
    clientsWithPhone,
    clientsWithEmail,
  } = clients;

  const {
    totalTickets,
    open,
    inProgress,
    notStarted,
    discarded,
    completed,
  } = tickets;

  const {
    totalEmails,
    sentEmails,
    pendingEmails,
  } = emails;

  const emailDeliveryRate = totalEmails > 0 ? Math.round((sentEmails / totalEmails) * 100) : 0;

  const {
    totalSMS,
    sentSMS,
    pendingSMS,
  } = sms;

  const smsDeliveryRate = totalSMS > 0 ? Math.round((sentSMS / totalSMS) * 100) : 0;

  const {
    totalWpp: totalMessages,
    mediaWpp: mediaMessages,
    deliveredWpp,
    textWpp: textMessages
  } = whatsapp;

  const deliveryRate = totalMessages > 0 ? Math.round((deliveredWpp / totalMessages) * 100) : 0;

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
                <IoTicketSharp className="w-5 h-5" />
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
                <IoTicketSharp className="w-5 h-5" />
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
                  <IoTicketSharp className="text-blue-400 w-5 h-5" />
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
                    value={open.toString()}
                    icon={BsCheckCircleFill}
                    color="#10B981"
                  />
                  <StatCard
                    title={t('ticketsStats.inProgress')}
                    value={inProgress.toString()}
                    icon={IoStatsChart}
                    color="#F59E0B"
                  />
                  <StatCard
                    title={t('ticketsStats.notStarted')}
                    value={notStarted.toString()}
                    icon={FaHourglassHalf}
                    color="#8B5CF6"
                  />
                  <StatCard
                    title={t('ticketsStats.discarded')}
                    value={discarded.toString()}
                    icon={FaHourglassHalf}
                    color="#8B5CF6"
                  />
                  <StatCard
                    title={t('ticketsStats.completed')}
                    value={completed.toString()}
                    icon={FaHourglassHalf}
                    color="#8B5CF6"
                  />


                </div>
              )}

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20">
                    <IoTicketSharp className="text-indigo-400 w-5 h-5" />
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