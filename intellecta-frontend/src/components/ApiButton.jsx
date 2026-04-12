import React from "react";

// This is a "Dumb" component. It just takes an 'onClick' and 'label' as Props.
function ApiButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="mt-6 px-8 py-3 bg-gradient-to-r from-red-500 to-blue-600 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform active:scale-95"
    >
      {label}
    </button>
  );
}

export default ApiButton;
