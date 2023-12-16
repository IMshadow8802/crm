import { useState } from "react";
import { X } from "react-feather";

function Editable(props) {
  const [isEditable, setIsEditable] = useState(false);
  const [inputText, setInputText] = useState(props.defaultValue || "");

  const submission = (e) => {
    e.preventDefault();
    if (inputText && props.onSubmit) {
      setInputText("");
      props.onSubmit(inputText);
    }
    setIsEditable(false);
  };

  return (
    <div className="editable w-full">
      {isEditable ? (
        <form
          className={`flex flex-col gap-4 rounded-lg ${props.editClass ? props.editClass : ""}`}
          onSubmit={submission}
        >
          <input
            type="text"
            value={inputText}
            placeholder={props.placeholder || props.text}
            onChange={(event) => setInputText(event.target.value)}
            autoFocus
            className="border-2 border-blue-500 rounded-lg outline-none font-semibold  px-4 py-2"
          />
          <div className="flex gap-2 items-center">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white  px-4 py-2 rounded-lg shadow-xl mb-5"
            >
              {props.buttonText || "Add"}
            </button>
            <X
              onClick={() => setIsEditable(false)}
              className="cursor-pointer h-6 w-6"
            />
          </div>
        </form>
      ) : (
        <p
          className={`editable_display ${props.displayClass ? props.displayClass : ""}`}
          onClick={() => setIsEditable(true)}
        >
          {props.text}
        </p>
      )}
    </div>
  );
}

export default Editable;
