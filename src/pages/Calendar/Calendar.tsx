import { useRef } from "react";
import { Scheduler } from "smart-webcomponents-react/scheduler";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";

const Calendar = () => {
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const scheduler = useRef(null);

  const today = new Date();
  const todayDate = today.getDate();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const data = [
    {
      label: "Aplicar Estratégia de Marketing",
      dateStart: new Date(currentYear, currentMonth, todayDate - 1, 0, 0),
      dateEnd: new Date(currentYear, currentMonth, todayDate + 3, 0, 0),
      backgroundColor: "#F59E0B",
    },
    {
      label: "Campanha Google Ads",
      dateStart: new Date(currentYear, currentMonth, todayDate, 9, 0),
      dateEnd: new Date(currentYear, currentMonth, todayDate, 10, 30),
      backgroundColor: "#EF4444",
    },
    {
      label: "Design dos Panfletos",
      dateStart: new Date(currentYear, currentMonth, todayDate - 1, 11, 30),
      dateEnd: new Date(currentYear, currentMonth, todayDate - 1, 14, 15),
      backgroundColor: "#3B82F6",
    },
    {
      label: "Revisão de Design",
      dateStart: new Date(currentYear, currentMonth, todayDate + 2, 13, 15),
      dateEnd: new Date(currentYear, currentMonth, todayDate + 2, 16, 15),
      backgroundColor: "#4B5563",
    },
  ];

  return (
    <div className="min-h-screen p-4">
          <Header name={authUser?.nome_completo} />
      <div className="max-w-7xl mx-auto rounded-2xl shadow-lg bg-white">
        <div className="p-4">
          <Scheduler
            ref={scheduler}
            id="scheduler"
            dataSource={data}
            view="week"
            views={["day", "week", "month"]}
            firstDayOfWeek={1}
            hourStart={7}
            hourEnd={21}
            timelineDayScale="halfHour"
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
