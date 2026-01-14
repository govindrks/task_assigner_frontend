import { useEffect, useState } from "react";
import { getTaskActivity } from "../api/activity.api";
import "./TaskActivityTimeline.css";

export default function TaskActivityTimeline({ taskId }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!taskId) return;

    getTaskActivity(taskId).then((res) =>
      setActivities(res.data || [])
    );
  }, [taskId]);

  if (activities.length === 0) {
    return (
      <div className="timeline empty">
        No activity yet
      </div>
    );
  }

  return (
    <div className="timeline">
      <h4 className="timeline-title">Activity</h4>

      {activities.map((a) => (
        <div key={a._id} className="timeline-item">
          <div className="dot" />

          <div className="content">
            <p>
              <strong>{a.performedBy?.name || "Someone"}</strong>{" "}
              {a.message}
            </p>

            <small>
              {new Date(a.createdAt).toLocaleString()}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}
