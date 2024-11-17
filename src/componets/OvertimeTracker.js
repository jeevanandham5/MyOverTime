import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Card,
  Statistic,
  Calendar,
  List,
  Modal,
  Form,
} from "antd";

const OvertimeTracker = () => {
  const [entries, setEntries] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(0.4); // Default rate in BHD
  const [hours, setHours] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    // Load data from local storage on mount
    const savedEntries =
      JSON.parse(localStorage.getItem("overtimeEntries")) || [];
    const savedRate = parseFloat(localStorage.getItem("hourlyRate")) || 0.4; // Default to 0.4 BHD
    setEntries(savedEntries);
    setHourlyRate(savedRate);
  }, []);

  useEffect(() => {
    // Save entries to local storage whenever they change
    localStorage.setItem("overtimeEntries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    // Save hourly rate to local storage whenever it changes
    localStorage.setItem("hourlyRate", hourlyRate);
  }, [hourlyRate]);

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalEarnings = totalHours * hourlyRate;

  const handleAddEntry = () => {
    if (!hours || isNaN(hours)) return;

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      hours: parseFloat(hours),
      earnings: parseFloat(hours) * hourlyRate,
    };

    setEntries([...entries, newEntry]);
    setHours("");
    setFormVisible(false);
  };

  const cellRender = (value) => {
    const formattedDate = value.format("YYYY-MM-DD");
    const dailyEntries = entries.filter(
      (entry) => entry.date === formattedDate
    );

    if (dailyEntries.length) {
      return (
        <ul className="events">
          {dailyEntries.map((entry) => (
            <li key={entry.id}>
              <span>{entry.hours} hrs</span>
            </li>
          ))}
        </ul>
      );
    }
    return null;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card title="Rate Settings" className="mb-4">
        <Input
          type="number"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
          addonAfter="BHD per hour"
          min="0"
        />
      </Card>

      <Card title="Summary" className="mb-4">
        <div className="flex gap-4">
          <Statistic title="Total Hours" value={totalHours.toFixed(1)} />
          <Statistic
            title="Total Earnings"
            value={totalEarnings.toFixed(2)}
            prefix="BHD"
          />
        </div>
      </Card>

      <Card title="Calendar" className="mb-4">
        <Calendar cellRender={cellRender} />
      </Card>

      <Card title="Recent Entries" className="mb-4">
        <List
          dataSource={entries}
          renderItem={(entry) => (
            <List.Item key={entry.id}>
              <List.Item.Meta
                title={entry.date}
                description={`${
                  entry.hours
                } hours - BHD${entry.earnings.toFixed(2)}`}
              />
            </List.Item>
          )}
        />
      </Card>

      <Button type="primary" onClick={() => setFormVisible(true)}>
        Add Overtime Entry
      </Button>

      <Modal
        title="Add Overtime Hours"
        open={formVisible} // Updated from "visible"
        onOk={handleAddEntry}
        onCancel={() => setFormVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Hours">
            <Input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Enter hours"
              step="0.5"
              min="0"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OvertimeTracker;
