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
import { useState } from "react";
import ModalCalendar from "./ModalCalendar";
import { messageAlert } from "../../utils/messageAlert";
import CreateEventModal from "./CreateEventModal";

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
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent>();
  const [isCalendarEventModalOpen, setIsCalendarEventModalOpen] =
    useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [isCreateCalendarEventModalOpen, setIsCreateCalendarEventModalOpen] =
    useState<boolean>(false);

  const { data, loading } = useSwr<CalendarInfo>(
    `/calendar/infos?user_id=${authUser?.id}`
  );
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
    });

    eventSources.push({
      events: ticketsSource,
      color: "#ff8c00",
      textColor: "white",
    });
  }

  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(info.dateStr);
    console.log(selectedDate, 'selectedDate');
    setIsCreateCalendarEventModalOpen(true);
  };

  const handleEventClick = (info: EventClickArg) => {
    const calendarEvent: CalendarEvent = {
      id: info.event.extendedProps.real_id,
      user_id: Number(info.event.extendedProps.user_id),
      title: info.event.title || "",
      start: info.event.start?.toISOString() || "",
      end: info.event.end?.toISOString(),
      description: info.event.extendedProps.description,
      status: info.event.extendedProps.status,
      allDay: info.event.allDay,
    };
    setSelectedEvent(calendarEvent);
    setIsCalendarEventModalOpen(true);
  };

  const renderEventContent = (arg: EventContentArg) => {
    const isTicket = arg.event.id.startsWith("t-");

    return (
      <div
        title={arg.event.title}
        className={`
          text-xs font-medium
          px-1 py-0.5
          truncate
          ${isTicket ? "bg-[#ff8c00] text-white" : "bg-blue-500 text-white"}
        `}
      >
        {arg.event.title}
      </div>
    );
  };

  const handleCreateEvent = async () => {
    try {
      alert("vsf");
    } catch (e) {
      console.log("Erro ao criar evento: ", e);
      messageAlert({
        type: "error",
        message: "Erro ao criar evento",
      });
    } finally {
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Header name={authUser?.nome_completo} />
      <div className="max-w-7xl mx-auto rounded-2xl shadow-lg bg-white w-full mt-5">
        {loading ? (
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
              locale="pt-br"
              height="700px"
              dayMaxEvents={3}
              dayMaxEventRows={3}
              buttonText={{
                today: "Hoje",
                month: "Mês",
                week: "Semana",
                day: "Dia",
                list: "Lista",
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
            <div className="flex gap-4 mt-4 text-sm px-2">
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                Evento
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-[#ff8c00]"></span>
                Ticket
              </div>
            </div>
          </div>
        )}
      </div>
      <ModalCalendar
        isVisible={isCalendarEventModalOpen}
        onClose={() => setIsCalendarEventModalOpen(false)}
        title="📅 Detalhes do Evento"
      >
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Título</p>
            <p className="text-base font-medium text-blue-600">
              {selectedEvent?.title}
            </p>
          </div>

          {selectedEvent?.description && (
            <div>
              <p className="text-sm text-gray-500">Descrição</p>
              <p className="text-base text-gray-700">
                {selectedEvent.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Início</p>
              <p className="text-base text-gray-700">
                {selectedEvent?.start &&
                  new Date(selectedEvent.start).toLocaleString("pt-BR")}
              </p>
            </div>
            {selectedEvent?.end && (
              <div>
                <p className="text-sm text-gray-500">Fim</p>
                <p className="text-base text-gray-700">
                  {new Date(selectedEvent.end).toLocaleString("pt-BR")}
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-base text-purple-600">
              {selectedEvent?.status ?? "Não definido"}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition">
              Excluir
            </button>
          </div>
        </div>
      </ModalCalendar>
      <CreateEventModal
        isOpen={isCreateCalendarEventModalOpen}
        onClose={() => setIsCreateCalendarEventModalOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
};

export default Calendar;
