import React, { useState, useEffect } from "react";
import "./header.css";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "../../models/User";
import { useSwr } from "../../api/useSwr";
import { IoIosNotifications } from "react-icons/io";
import { Drawer, List, Card, Spin, Button, Badge } from "antd";
import { api } from "../../api/api";
import dayjs from "dayjs";
import { LoadingOutlined } from "@ant-design/icons";

interface HeaderProps {
  name?: string;
  url?: string;
}

interface Permit {
  id: number;
  client_id: number;
  state: string;
  expiration_date: string;
  overweight: boolean;
  created_at: string;
  updated_at: string;
  oscar?: string;
}

const Header: React.FC<HeaderProps> = ({ name, url }) => {
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [open, setOpen] = useState(false);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const { data } = useSwr<User>(authUser ? `usersTable/${authUser.id}` : "");

  const whiteSpinner = (
    <LoadingOutlined
      style={{ fontSize: 24, color: "white", marginBottom: "15px" }}
      spin
    />
  );

  const getNotifications = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await api.get("/permits/near-expiration", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPermits(response.data);
      setNotificationCount(response.data.length);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === "/permits") {
      getNotifications();
    }
  }, [location.pathname]);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setPermits([]);
  };

  const formatExpirationDate = (expirationDate: string) => {
    return dayjs(expirationDate).format("DD/MM/YYYY");
  };

  return (
    <div className="header-container">
      <div className="padding"></div>
      <div className="flex items-center justify-center gap-3">
        {location.pathname === "/permits" &&
          (loading ? (
            <div style={{ textAlign: "center" }}>
              <Spin indicator={whiteSpinner} />
            </div>
          ) : (
            <Badge count={notificationCount} color="red">
              <IoIosNotifications
                onClick={showDrawer}
                className="cursor-pointer w-8 h-8 mb-1 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110"
              />
            </Badge>
          ))}

        <Drawer
          title="Permits Perto de Expirar"
          closable
          onClose={onClose}
          open={open}
          width={420}
          footer={
            <div style={{ textAlign: "center" }}>
              <Button onClick={onClose} type="primary" block>
                Fechar
              </Button>
            </div>
          }
        >
          {loading ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              {permits.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={permits}
                  renderItem={(permit: Permit) => (
                    <List.Item>
                      <Card
                        style={{
                          width: "100%",
                          marginBottom: "10px",
                          backgroundColor: "#f9f9f9",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                          Client ID: {permit.client_id}
                        </h4>
                        <p>
                          <strong>Estado:</strong> {permit.state}
                        </p>
                        <p>
                          <strong>Data de Expiração:</strong>{" "}
                          {formatExpirationDate(permit.expiration_date)}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          {dayjs(permit.expiration_date).isBefore(dayjs()) ? (
                            <span style={{ color: "red" }}>Expirado</span>
                          ) : (
                            <span style={{ color: "orange" }}>
                              Perto de Expirar
                            </span>
                          )}
                        </p>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <p style={{ textAlign: "center" }}>
                  Nenhum permit perto de expirar.
                </p>
              )}
            </>
          )}
        </Drawer>

        <div
          className="logout"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/profile")}
        >
          <img
            src={
              url ||
              data?.url ||
              `https://ui-avatars.com/api/?name=${
                data?.nome_completo || data?.nome_usuario || "Usuário"
              }&background=0D8ABC&color=fff&size=128&rounded=true`
            }
            alt="Avatar"
            style={{ width: "34px", height: "34px", borderRadius: "50%" }}
          />
          <p>{name}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
