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
  FloatButton,
  ConfigProvider,
  theme,
  Layout,
  Switch,
  Divider,
  ColorPicker,
  Typography,
} from "antd";
import {
  CoffeeOutlined,
  FieldTimeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import QR from "../QR.jpeg";

const OvertimeTracker = () => {
  const [entries, setEntries] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(0.4); // Default rate in BHD
  const [hours, setHours] = useState("");
  const [coffee, setCoffee] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // Tracks the selected month
  const [isDarkTheme, setIsDarkTheme] = useState(
    JSON.parse(localStorage.getItem("isDarkTheme")) || false
  ); // Boolean theme state
  const [primaryColor, setPrimaryColor] = useState(
    localStorage.getItem("primaryColor") || "#1890ff"
  ); // Default primary color

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

  useEffect(() => {
    // Save theme preference to local storage
    localStorage.setItem("isDarkTheme", JSON.stringify(isDarkTheme));
  }, [isDarkTheme]);

  useEffect(() => {
    // Save primary color to local storage
    localStorage.setItem("primaryColor", primaryColor);
  }, [primaryColor]);

  const handleMonthChange = (value) => {
    setSelectedMonth(value.toDate());
  };

  const totalHours = entries
    .filter(
      (entry) =>
        new Date(entry.date).getFullYear() === selectedMonth.getFullYear() &&
        new Date(entry.date).getMonth() === selectedMonth.getMonth()
    )
    .reduce((sum, entry) => sum + entry.hours, 0);

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

  const handleColorChange = (color) => {
    setPrimaryColor(color.toHexString()); // Ant Design `ColorPicker` provides color in `toHexString` format
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: primaryColor,
        },
      }}
    >
      <Layout>
        <Layout.Header
          style={{ background: primaryColor, color: "white" }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-5">
            <FieldTimeOutlined style={{ fontSize: "30px" }} />
            <Typography className=" font-extrabold text-white">
              MY-OT
            </Typography>
          </div>
        </Layout.Header>
        <div className="p-4 max-w-4xl mx-auto">
          <Card
            title={`Summary for ${selectedMonth.toLocaleString("default", {
              month: "long",
            })} ${selectedMonth.getFullYear()}`}
            className="mb-4"
          >
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
            <Calendar
              cellRender={cellRender}
              onPanelChange={handleMonthChange}
            />
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
            open={formVisible}
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

          <Modal
            title="Customize Theme"
            open={themeModalVisible}
            onOk={() => setThemeModalVisible(false)}
            onCancel={() => setThemeModalVisible(false)}
          >
            <div>
              <Divider>Theme Mode</Divider>
              <Switch
                checked={isDarkTheme}
                onChange={setIsDarkTheme}
                checkedChildren="Dark"
                unCheckedChildren="Light"
              />
              <Divider>Primary Color</Divider>
              <ColorPicker value={primaryColor} onChange={handleColorChange} />
              <Divider>Rate Settings</Divider>
              <Card title="Rate Settings" className="mb-4">
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) =>
                    setHourlyRate(parseFloat(e.target.value) || 0)
                  }
                  addonAfter="BHD per hour"
                  min="0"
                />
              </Card>
            </div>
          </Modal>

          <FloatButton
            tooltip="Customize Theme"
            type="primary"
            icon={<SettingOutlined />}
            style={{ right: 20, bottom: 20 }}
            onClick={() => setThemeModalVisible(true)}
          ></FloatButton>
        </div>
        <Layout.Footer>
          <div className="flex items-center justify-between">
            <p>
              App by -
              <a
                style={{ color: primaryColor }}
                href="https://github.com/jeevanandham5"
              >
                jeevanandham
              </a>
            </p>
            <Button
              icon={<CoffeeOutlined />}
              iconPosition={"end"}
              onClick={() => setCoffee(true)}
            >
              buy me a coffee
            </Button>
            <Modal
              title="Buy Me A Coffee"
              open={coffee}
              onOk={() => setCoffee(false)}
              onCancel={() => setCoffee(false)}
            >
              <div>
                <img src={QR} alt="qr" className=" rounded-lg"></img>
              </div>
            </Modal>
          </div>
        </Layout.Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default OvertimeTracker;
