/* eslint-disable @typescript-eslint/no-explicit-any */
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  EventClickArg,
  EventContentArg,
  EventSourceInput,
} from "@fullcalendar/core";
import { useSwr } from "../../api/useSwr";
import Spin from "../../components/Spin/Spin";
import { useEffect, useState } from "react";
import ModalCalendar from "./ModalCalendar";
import { messageAlert } from "../../utils/messageAlert";
import { FiCalendar } from "react-icons/fi";
import { api } from "../../api/api";
import { useTranslation } from "react-i18next";
import ptBr from '@fullcalendar/core/locales/pt-br';
import enGb from '@fullcalendar/core/locales/en-gb';
import es from '@fullcalendar/core/locales/es';

const localeMap = {
  'pt-BR': ptBr,
  en: enGb,
  es: es,
};
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  user_id: number | string;
  start: string;
  end?: string;
  allDay: boolean;
  backgroundColor?: string;
  status?: string;
  type?: string;
  tags?: string[];
  repeat?: boolean;
  type_selected?: string;
  user_name?: string;
}

interface TicketEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
}

interface CalendarInfo {
  events: {
    id: number;
    label: string;
    start_date: string;
    end_date?: string;
    all_day: boolean;
    background_color: string;
    status: string;
  }[];
  tickets: {
    id: number;
    name: string;
    created_at: string;
  }[];
}

const Calendar = () => {
  const { t, i18n } = useTranslation();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent>();
  const [isCalendarEventModalOpen, setIsCalendarEventModalOpen] = useState<boolean>(false);
  const [isCreateCalendarEventModalOpen, setIsCreateCalendarEventModalOpen] = useState<boolean>(false);
  const [titleEvent, setTitleEvent] = useState('');
  const [descriptionEvent, setDescriptionEvent] = useState('');
  const [dateInitial, setDateInitial] = useState('');
  const [dateFinal, setDateFinal] = useState('');
  const [color, setColor] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [statusEvent, setStatusEvent] = useState('');
  const [locale, setLocale] = useState(ptBr);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const { data, loading, mutate } = useSwr<CalendarInfo>(`/calendar/infos?user_id=${authUser?.id}`);
  const eventSources: EventSourceInput[] = [];

  if (data) {
    const eventsSource = data.events.map((evt) => ({
      id: evt.id.toString(),
      title: evt.label,
      start: evt.start_date,
      end: evt.end_date,
      allDay: evt.all_day,
      backgroundColor: evt.background_color,
    })) as CalendarEvent[];

    const ticketsSource = data.tickets.map((tkt) => ({
      id: `t-${tkt.id}`,
      title: tkt.name,
      start: tkt.created_at,
      allDay: true,
    })) as TicketEvent[];

    eventSources.push({
      events: eventsSource,
      borderColor: "transparent",
    });

    eventSources.push({
      events: ticketsSource,
      color: "#ff8c00",
      textColor: "white",
      borderColor: "transparent",
    });
  }

  const handleDateClick = (info: { dateStr: string }) => {
    setDateInitial(info.dateStr);
    setIsCreateCalendarEventModalOpen(true);
  };

  const handleEventClick = async (info: EventClickArg) => {
    const id = info.event.id;

    const isTicket = id.startsWith("t-");

    try {
      if (isTicket) {
        const ticketId = id.replace("t-", "");
        const res = await api.get(`/tickets/showToCalendar/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const ticket = res?.data;

        const ticketEvent: CalendarEvent = {
          id: ticket.ticket.id.toString(),
          title: ticket.ticket.name,
          type: ticket.ticket.type,
          start: ticket.ticket.created_at,
          tags: ticket.ticket.tags || [],
          status: ticket.ticket.status,
          allDay: true,
          user_id: ticket.ticket.user_id,
          description: ticket.ticket.observation,
          type_selected: "ticket",
          user_name: ticket.user_name
        };

        setSelectedEvent(ticketEvent);
      } else {
        const res = await api.get(`/calendar/event/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const event = res?.data?.data;

        const calendarEvent: CalendarEvent = {
          id: event?.id?.toString(),
          title: event.label,
          start: event.start_date,
          end: event.end_date,
          allDay: event.all_day,
          user_id: event.user_id,
          description: event.description,
          backgroundColor: event.background_color,
          status: event.status,
          repeat: event.repeat,
          type_selected: "event",
        };

        setSelectedEvent(calendarEvent);
      }

      setIsCalendarEventModalOpen(true);
    } catch (error) {
      console.error("Erro ao buscar evento/ticket por ID:", error);
      messageAlert({
        type: "error",
        message: t("calendar.error_event"),
      });
    }
  };

  const renderEventContent = (arg: EventContentArg) => {
    const isTicket = arg.event.id.startsWith("t-");
    const isGoogle = arg.backgroundColor === '#66A9FF';

    return (
      <div
        title={arg.event.title}
        style={{
          border: "none",
        }}
        className={`
          text-xs font-medium
          px-1 py-0.5
          truncate
          ${isTicket ? "bg-[#ff8c00] text-white" : isGoogle ? 'bg-[#66A9FF] text-white' : `text-white bg-[${arg.backgroundColor}] border-transparent`}
        `}
      >
        {arg.event.title}
      </div>
    );
  };

  const handleCreateEvent = async () => {
    try {
      const payload = {
        label: titleEvent,
        description: descriptionEvent,
        start_date: dateInitial || null,
        end_date: dateFinal || null,
        all_day: isAllDay,
        repeat: isRepeating,
        background_color: color,
        user_id: authUser?.id,
        status: statusEvent
      };

      await api.post("/calendar/events", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      messageAlert({
        type: "success",
        message: t("calendar.success_create"),
      });

      setIsCreateCalendarEventModalOpen(false);
      setTitleEvent("");
      setDescriptionEvent("");
      setDateInitial("");
      setDateFinal("");
      setColor("#3b82f6");
      setIsAllDay(false);
      setIsRepeating(false);

      mutate();
    } catch (err: any) {
      console.error(err);
      messageAlert({
        type: "error",
        message:
          err.response?.data?.error ||
          t("calendar.error_create"),
      });
    }
  };

  useEffect(() => {
    const newLocale = localeMap[i18n.language as keyof typeof localeMap] || ptBr;
    setLocale(newLocale);
  }, [i18n.language]);
  
  const handleGoogleSync = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar',
    prompt: 'consent',
    onSuccess: async (tokenResponse) => {
      setLoadingGoogle(true);
      const accessToken = tokenResponse.access_token;
  
      const res = await api.post("/calendar/google-sync", { access_token: accessToken }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });
  
      const googleEvents = res.data.events;
      eventSources.push({
        events: googleEvents,
        color: "#66A9FF",
        textColor: "white",
        borderColor: "transparent",
      });

      messageAlert({ type: "success", message: "Eventos sincronizados com sucesso!" });
      setLoadingGoogle(false);
    },
    onError: () => {
      messageAlert({ type: "error", message: "Falha ao autenticar com o Google." });
      setLoadingGoogle(false);
    }
  });

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Header name={authUser?.nome_completo} />
      <div className="max-w-7xl mx-auto rounded-2xl shadow-lg bg-white w-full mt-5">
        {loading || loadingGoogle ? (
          <Spin />
        ) : (
          <div className="p-4 h-full w-full">
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              initialView="dayGridMonth"
              locale={locale}
              key={i18n.language}
              height="700px"
              dayMaxEvents={3}
              dayMaxEventRows={3}
              buttonText={{
                today: t("calendar.today"),
                month: t("calendar.month"),
                week: t("calendar.week"),
                day: t("calendar.day"),
                list: t("calendar.list"),
              }}
              eventSources={eventSources}
              eventContent={renderEventContent}
              headerToolbar={{
                start: "prev,next today",
                center: "title",
                end: "listMonth,dayGridMonth,timeGridWeek,timeGridDay",
              }}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              allDayText="GMT-03"
              moreLinkText={(count) =>
                count > 1 ? `+${count} Eventos` : `+${count} Evento`
              }
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              dayCellClassNames={() =>
                "transition duration-300 cursor-pointer hover:bg-gray-200"
              }
              slotLaneClassNames={() =>
                "transition duration-300 cursor-pointer hover:bg-gray-100"
              }
            />
            <div className="flex gap-4 mt-4 text-sm px-2 justify-between w-full">
              <div className="flex items-start justify-start gap-4">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#ff8c00]"></span>
                  {t("calendar.ticket")}
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#66A9FF]"></span>
                  Google
                </div>
              </div>
              <button
                onClick={() => handleGoogleSync()}
                className="
                  flex items-center gap-2
                  px-4 py-2
                  bg-white
                  border border-gray-300
                  rounded-lg
                  shadow-sm
                  hover:shadow-md
                  hover:bg-gray-50
                  transition-all
                  text-sm font-medium
                "
              >
                <FcGoogle size={20} />
                Sincronizar com Google Calendar
              </button>
            </div>
          </div>
        )}
      </div>
      <ModalCalendar
        isVisible={isCalendarEventModalOpen}
        onClose={() => setIsCalendarEventModalOpen(false)}
        title={t("calendar.modal_details.title_modal")}
      >
        {selectedEvent?.type_selected === "ticket" ? (
          <div className="space-y-5 text-gray-800">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">{t("calendar.modal_details.title")}</p>
              <p className="text-lg font-semibold text-blue-600">
                {selectedEvent?.title}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">{t("calendar.modal_details.type")}</p>
              <p className="text-sm font-medium">{selectedEvent?.type}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Usuário</p>
              <p className="text-sm font-medium">{selectedEvent?.user_name}</p>
            </div>

            {selectedEvent?.description && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t("calendar.modal_details.description")}</p>
                <p
                  className="text-sm text-gray-700 line-clamp-5"
                  title={selectedEvent.description}
                >
                  {selectedEvent.description}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs text-gray-500">{t("calendar.modal_details.initial")}</p>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 shadow-sm text-sm text-gray-700">
                <FiCalendar className="text-blue-500" />
                <span>
                  {selectedEvent?.start &&
                    new Date(selectedEvent.start).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">{t("calendar.modal_details.status")}</p>
              <p className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700">
                {selectedEvent?.status ?? "Não definido"}
              </p>
            </div>

            {selectedEvent?.tags && selectedEvent?.tags?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t("calendar.modal_details.tags")}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                checked={selectedEvent.allDay}
                readOnly
                className="form-checkbox rounded text-blue-600"
              />
              <label className="text-sm">{t("calendar.modal_details.all_day")}</label>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-gray-800">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">{t("calendar.modal_details.title")}</p>
              <p className="text-lg font-semibold text-blue-600">
                {selectedEvent?.title}
              </p>
            </div>

            {selectedEvent?.description && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t("calendar.modal_details.description")}</p>
                <p className="text-sm text-gray-700">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t("calendar.modal_details.initial")}</p>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 shadow-sm text-sm text-gray-700">
                  <FiCalendar className="text-blue-500" />
                  <span>
                    {selectedEvent?.start &&
                      new Date(selectedEvent.start).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                  </span>
                </div>
              </div>

              {selectedEvent?.end && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">{t("calendar.modal_details.final")}</p>
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 shadow-sm text-sm text-gray-700">
                    <FiCalendar className="text-blue-500" />
                    <span>
                      {new Date(selectedEvent.end).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">{t("calendar.modal_details.status")}</p>
              <p className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700">
                {selectedEvent?.status ?? "Não definido"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">{t("calendar.modal_details.color")}</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: selectedEvent?.backgroundColor }}
                />
                <p className="text-sm">{selectedEvent?.backgroundColor}</p>
              </div>
            </div>

            {selectedEvent?.repeat && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{t("calendar.modal_details.repeat")}</p>
                <p className="text-sm text-gray-700">{selectedEvent.repeat}</p>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                checked={selectedEvent?.allDay}
                readOnly
                className="form-checkbox rounded text-blue-600"
              />
              <label className="text-sm">{t("calendar.modal_details.all_day")}</label>
            </div>

            <div className="flex justify-end gap-2 pt-6">
              <button className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition">
                {t("calendar.modal_details.remove")}
              </button>
            </div>
          </div>
        )}
      </ModalCalendar>
      <ModalCalendar
        isVisible={isCreateCalendarEventModalOpen}
        onClose={() => setIsCreateCalendarEventModalOpen(false)}
        title={t("calendar.modal_create.title_modal")}
      >
        <form
          className="space-y-4 p-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateEvent();
          }}
        >
          <div>
            <label className="text-sm font-medium text-gray-700">{t("calendar.modal_create.title")}</label>
            <input
              value={titleEvent}
              onChange={(e) => setTitleEvent(e.target.value)}
              type="text"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t("calendar.modal_create.placeholder_title")}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("calendar.modal_create.description")}
            </label>
            <textarea
              value={descriptionEvent}
              onChange={(e) => setDescriptionEvent(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t("calendar.modal_create.placeholder_description")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("calendar.modal_create.date_initial")}
              </label>
              <input
                value={dateInitial}
                onChange={(e) => setDateInitial(e.target.value)}
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("calendar.modal_create.date_final")}
              </label>
              <input
                value={dateFinal}
                onChange={(e) => setDateFinal(e.target.value)}
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full ${
                  isAllDay ? "bg-blue-500" : "bg-gray-300"
                }`}
                onClick={() => setIsAllDay(!isAllDay)}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full shadow-md transition duration-200 ease-in-out ${
                    isAllDay ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </div>
              <span className="text-sm text-gray-700">{t("calendar.modal_create.all_day")}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <div
                className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full ${
                  isRepeating ? "bg-blue-500" : "bg-gray-300"
                }`}
                onClick={() => setIsRepeating(!isRepeating)}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full shadow-md transition duration-200 ease-in-out ${
                    isRepeating ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </div>
              <span className="text-sm text-gray-700">{t("calendar.modal_create.repeat")}</span>
            </label>
          </div>

          <div className="flex flex-col items-start justify-start gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t("calendar.modal_create.color")}
            </label>

            <div className="relative">
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                type="color"
                defaultValue="#007BFF"
                className="absolute left-0 top-0 h-10 w-10 opacity-0 cursor-pointer"
              />
              <div
                className="w-10 h-10 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              ></div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">{t("calendar.modal_create.status")}</label>
            <select
              value={statusEvent}
              onChange={(e) => setStatusEvent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              defaultValue="Não iniciada"
            >
              <option value="Não iniciada">{t("status.not_started")}</option>
              <option value="Esperando">{t("status.waiting")}</option>
              <option value="Em progresso">{t("status.in_progress")}</option>
              <option value="Completa">{t("status.resolved")}</option>
              <option value="Descartada">{t("status.closed")}</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <button
              type="button"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition"
              onClick={() => setIsCreateCalendarEventModalOpen(false)}
            >
              {t("calendar.modal_create.cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-700 transition"
            >
              {t("calendar.modal_create.create")}
            </button>
          </div>
        </form>
      </ModalCalendar>
    </div>
  );
};

export default Calendar;
