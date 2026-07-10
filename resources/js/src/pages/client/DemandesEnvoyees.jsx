import { ClipboardList } from "lucide-react";
import ClientTopNav from "../../components/ClientTopNav";
import "../../assets/styles/ClientDashboard.css";

export default function DemandesEnvoyees() {
  return (
    <div className="cd-root">
      <ClientTopNav activeKey="demandes" />

      <main className="cd-main">
        <div className="cd-page cd-placeholder">
          <div className="cd-placeholder-inner">
            <ClipboardList size={40} />
            <h2>Demandes envoyées</h2>
            <p>Cette section est en cours de développement.</p>
          </div>
        </div>
      </main>
    </div>
  );
}