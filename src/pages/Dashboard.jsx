import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

const mockTasks = {
  TODO: [
    { id: 1, title: "Design login page" },
    { id: 2, title: "Setup backend auth" },
  ],
  IN_PROGRESS: [
    { id: 3, title: "Integrate frontend & backend" },
  ],
  DONE: [
    { id: 4, title: "Create project repo" },
  ],
};

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <div className="board">
          {Object.entries(mockTasks).map(([status, tasks]) => (
            <div key={status} className="column">
              <h3>{status.replace("_", " ")}</h3>

              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  {task.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
