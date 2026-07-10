import { MessageSquare } from "lucide-react";
import ClientTopNav from "../../components/ClientTopNav";
import "../../assets/styles/ClientDashboard.css";

export default function Messages() {
  return (
    <div className="cd-root">
      <ClientTopNav activeKey="messages" />

      <main className="cd-main">
        <div className="cd-page cd-placeholder">
          <div className="cd-placeholder-inner">
            <MessageSquare size={40} />
            <h2>Messages</h2>
            <p>Cette section est en cours de développement.</p>
          </div>
        </div>
      </main>
    </div>
  );
}