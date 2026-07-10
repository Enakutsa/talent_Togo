import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import ClientTopNav from "../../components/ClientTopNav";
import "../../assets/styles/ClientDashboard.css";

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="cd-root">
      <ClientTopNav activeKey="dashboard" />

      <main className="cd-main">
        <div className="cd-page">
          <div className="cd-page-header">
            <div>
              <h1 className="cd-page-title">Bonjour, {user?.prenom || "Client"} 👋</h1>
              <p className="cd-page-sub">Retrouvez vos talents favoris et vos échanges ici.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}