// import { useTranslation } from "react-i18next";
import { FaEnvelope, FaUsers, FaCalendarAlt, FaWhatsapp } from "react-icons/fa";
import { MdSms, MdAttachFile } from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";
import { BsCheckCircleFill } from "react-icons/bs";
import { HiDocumentText } from "react-icons/hi";
import { RiMessage2Fill } from "react-icons/ri";
import Spin from "../../components/Spin/Spin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { MetricsSummary, getMetricsSummary } from "../../services/metricsService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const Metrics = () => {
  // const { t } = useTranslation();
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);

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
    subtitle = null 
  }: { 
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    subtitle?: string | null;
  }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
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

  const emailStatusData = metrics?.email_metrics.status_breakdown ? [
    { name: "Enviados", value: metrics.email_metrics.status_breakdown.sent },
    { name: "Pendentes", value: metrics.email_metrics.status_breakdown.pending },
    { name: "Erros", value: metrics.email_metrics.status_breakdown.error },
  ] : [];

  const smsStatusData = metrics?.sms_metrics.status_breakdown ? [
    { name: "Enviados", value: metrics.sms_metrics.status_breakdown.sent },
    { name: "Pendentes", value: metrics.sms_metrics.status_breakdown.pending },
    { name: "Erros", value: metrics.sms_metrics.status_breakdown.error },
  ] : [];

  const whatsappStatusData = metrics?.whatsapp_metrics.status_breakdown ? [
    { name: "Enviadas", value: metrics.whatsapp_metrics.status_breakdown.sent },
    { name: "Pendentes", value: metrics.whatsapp_metrics.status_breakdown.pending },
    { name: "Falhas", value: metrics.whatsapp_metrics.status_breakdown.failed }
  ] : [];

  const whatsappTypeData = metrics?.whatsapp_metrics.type_breakdown ? [
    { name: "Texto", value: metrics.whatsapp_metrics.type_breakdown.text },
    { name: "Imagem", value: metrics.whatsapp_metrics.type_breakdown.image },
    { name: "Vídeo", value: metrics.whatsapp_metrics.type_breakdown.video },
    { name: "Áudio", value: metrics.whatsapp_metrics.type_breakdown.audio },
    { name: "Documento", value: metrics.whatsapp_metrics.type_breakdown.document },
    { name: "Outros", value: metrics.whatsapp_metrics.type_breakdown.other }
  ] : [];

  return (
    <div className="p-6 min-h-screen ">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <IoStatsChart className="text-blue-400" />
          Métricas do Sistema
        </h1>
        <p className="text-white mt-1">Visão geral das métricas de e-mails e SMS</p>
      </div>

      {/* Email Metrics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaEnvelope className="text-blue-400" />
          Métricas de E-mails
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total de E-mails"
            value={metrics?.email_metrics.total_scheduled || 0}
            icon={FaEnvelope}
            color="bg-blue-500"
            subtitle="Agendados"
          />
          <StatCard
            title="E-mails Enviados"
            value={metrics?.email_metrics.total_sent || 0}
            icon={BsCheckCircleFill}
            color="bg-green-500"
          />
          <StatCard
            title="Destinatários Únicos"
            value={metrics?.email_metrics.unique_recipients || 0}
            icon={FaUsers}
            color="bg-purple-500"
          />
          <StatCard
            title="Taxa de Entrega"
            value={`${Math.round((metrics?.email_metrics.total_sent || 0) / (metrics?.email_metrics.total_scheduled || 1) * 100)}%`}
            icon={IoStatsChart}
            color="bg-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Email Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emailStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {emailStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Email Stats */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Envios por Dia</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics?.email_metrics.daily_stats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Horários de Pico</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.email_metrics.peak_hours || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SMS Metrics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <MdSms className="text-green-400" />
          Métricas de SMS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total de SMS"
            value={metrics?.sms_metrics.total_scheduled || 0}
            icon={MdSms}
            color="bg-green-500"
            subtitle="Agendados"
          />
          <StatCard
            title="SMS com Arquivos"
            value={metrics?.sms_metrics.messages_with_files || 0}
            icon={MdAttachFile}
            color="bg-yellow-500"
          />
          <StatCard
            title="Agendamentos Futuros"
            value={metrics?.sms_metrics.future_schedules.reduce((acc, curr) => acc + curr.count, 0) || 0}
            icon={FaCalendarAlt}
            color="bg-orange-500"
          />
          <StatCard
            title="Taxa de Entrega"
            value={`${Math.round((metrics?.sms_metrics.status_breakdown.sent || 0) / (metrics?.sms_metrics.total_scheduled || 1) * 100)}%`}
            icon={IoStatsChart}
            color="bg-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SMS Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={smsStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {smsStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Future Schedules */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Agendamentos Futuros</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.sms_metrics.future_schedules || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Metrics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaWhatsapp className="text-green-400" />
          Métricas do WhatsApp
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total de Mensagens"
            value={metrics?.whatsapp_metrics.total_messages || 0}
            icon={RiMessage2Fill}
            color="bg-green-600"
          />
          <StatCard
            title="Mensagens com Mídia"
            value={metrics?.whatsapp_metrics.messages_with_media || 0}
            icon={MdAttachFile}
            color="bg-blue-600"
          />
          <StatCard
            title="Taxa de Entrega"
            value={`${Math.round((metrics?.whatsapp_metrics.status_breakdown.sent || 0) / (metrics?.whatsapp_metrics.total_messages || 1) * 100)}%`}
            icon={BsCheckCircleFill}
            color="bg-emerald-600"
          />
          <StatCard
            title="Mensagens de Texto"
            value={metrics?.whatsapp_metrics.type_breakdown.text || 0}
            icon={HiDocumentText}
            color="bg-indigo-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={whatsappStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {whatsappStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Message Types Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Tipos de Mensagem</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={whatsappTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {whatsappTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instance Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Mensagens por Instância</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.whatsapp_metrics.instance_breakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="instance_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="message_count" name="Mensagens" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Messages by User */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Mensagens por Usuário</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.whatsapp_metrics.messages_by_user || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="user_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="message_count" name="Mensagens" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;