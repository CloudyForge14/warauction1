import React from 'react';

const ArtilleryCard = ({ option, isSelected, onSelect }) => {
  return (
    <div
      className={`p-4 bg-gray-700 rounded-lg shadow-md cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-600'
      }`}
      onClick={() => onSelect(option.id)}
    >
      <img
        src={option.image}
        alt={option.name}
        className="w-full h-32 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold">{option.name}</h3>
      <p className="text-gray-400">${option.cost}</p>
    </div>
  );
};

export default ArtilleryCard;