import React, { useEffect, useState } from "react";
import {
  Calendar,
  CheckSquare,
  List,
  Tag,
  Trash,
  Type,
  X,
} from "react-feather";

import Modal from "../../Modal/Modal";
import Editable from "../../Editable/Editable";

function CardInfo(props) {
  const colors = [
    "#a8193d",
    "#4fcc25",
    "#1ebffa",
    "#8da377",
    "#9975bd",
    "#cf61a1",
    "#240959",
  ];

  const [selectedColor, setSelectedColor] = useState("");
  const [values, setValues] = useState({
    ...props.card,
  });

  const updateTitle = (value) => {
    setValues({ ...values, title: value });
  };

  const updateDesc = (value) => {
    setValues({ ...values, desc: value });
  };

  const addLabel = (label) => {
    const index = values.labels.findIndex((item) => item.text === label.text);
    if (index > -1) return;

    setSelectedColor("");
    setValues({
      ...values,
      labels: [...values.labels, label],
    });
  };

  const removeLabel = (label) => {
    const tempLabels = values.labels.filter((item) => item.text !== label.text);

    setValues({
      ...values,
      labels: tempLabels,
    });
  };

  const addTask = (value) => {
    const task = {
      id: Date.now() + Math.random() * 2,
      completed: false,
      text: value,
    };
    setValues({
      ...values,
      tasks: [...values.tasks, task],
    });
  };

  const removeTask = (id) => {
    const tasks = [...values.tasks];

    const tempTasks = tasks.filter((item) => item.id !== id);
    setValues({
      ...values,
      tasks: tempTasks,
    });
  };

  const updateTask = (id, value) => {
    const tasks = [...values.tasks];

    const index = tasks.findIndex((item) => item.id === id);
    if (index < 0) return;

    tasks[index].completed = value;

    setValues({
      ...values,
      tasks,
    });
  };

  const calculatePercent = () => {
    if (!values.tasks?.length) return 0;
    const completed = values.tasks?.filter((item) => item.completed)?.length;
    return (completed / values.tasks?.length) * 100;
  };

  const updateDate = (date) => {
    if (!date) return;

    setValues({
      ...values,
      date,
    });
  };

  useEffect(() => {
    if (props.updateCard) props.updateCard(props.boardId, values.id, values);
  }, [values]);

  return (
    <Modal onClose={props.onClose}>
      <div className="p-8 flex flex-col gap-8 min-w-[550px] w-auto max-w-[650px]">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-2 items-center">
            <Type size={18} />
            <p className="font-bold text-1.2rem">Title</p>
          </div>
          <Editable
            defaultValue={values.title}
            text={values.title}
            placeholder="Enter Title"
            onSubmit={updateTitle}
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-2 items-center">
            <List size={18} />
            <p className="font-bold text-1.2rem">Description</p>
          </div>
          <Editable
            defaultValue={values.desc}
            text={values.desc || "Add a Description"}
            placeholder="Enter description"
            onSubmit={updateDesc}
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-2 items-center">
            <Calendar size={18} />
            <p className="font-bold text-1.2rem">Date</p>
          </div>
          <input
            type="date"
            defaultValue={values.date}
            min={new Date().toISOString().substr(0, 10)}
            onChange={(event) => updateDate(event.target.value)}
            className="w-full border-2 border-gray-300 rounded-md p-2 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-2 items-center">
            <Tag size={18} />
            <p className="font-bold text-1.2rem">Labels</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {values.labels?.map((item, index) => (
              <label
                key={index}
                style={{ backgroundColor: item.color }}
                className="rounded-full bg-gray-700 text-white p-2 flex items-center gap-2"
              >
                {item.text}
                <X size={18} onClick={() => removeLabel(item)} />
              </label>
            ))}
          </div>
          <ul className="flex gap-4 ml-4">
            {colors.map((item, index) => (
              <li
                key={index + item}
                style={{ backgroundColor: item }}
                className={`w-4 h-4 rounded-full cursor-pointer ${
                  selectedColor === item ? "border-2 border-yellow-400" : ""
                }`}
                onClick={() => setSelectedColor(item)}
              />
            ))}
          </ul>
          <Editable
            text="Add Label"
            placeholder="Enter label text"
            onSubmit={(value) =>
              addLabel({ color: selectedColor, text: value })
            }
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-2 items-center">
            <CheckSquare size={18} />
            <p className="font-bold text-1.2rem">Tasks</p>
          </div>
          <div className="w-full">
            <div
              className="h-2 bg-skyblue w-[100%] rounded-md"
              style={{
                width: `${calculatePercent()}%`,
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            {values.tasks?.map((item) => (
              <div
                key={item.id}
                className="flex gap-2 items-center"
              >
                <input
                  type="checkbox"
                  defaultChecked={item.completed}
                  onChange={(event) =>
                    updateTask(item.id, event.target.checked)
                  }
                  className="h-4 w-4 cursor-pointer"
                />
                <p
                  className={`flex-1 ${
                    item.completed ? "line-through" : ""
                  }`}
                >
                  {item.text}
                </p>
                <Trash
                  size={18}
                  onClick={() => removeTask(item.id)}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>
          <Editable
            text="Add a Task"
            placeholder="Enter task"
            onSubmit={addTask}
          />
        </div>
      </div>
    </Modal>
  );
}

export default CardInfo;
