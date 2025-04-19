import React, { useState } from 'react';
import Accordion from '../components/ui/Accordion';
import Alert from '../components/ui/Alert';
import Card from '../components/ui/Card';
import Category from '../components/ui/Category';
import File from '../components/ui/File';
import Filter from '../components/ui/Filter';
import Image from '../components/ui/Image';
import PopOver from '../components/ui/PopOver';
import StarRating from '../components/ui/StarRating';
import StatusPopover from '../components/ui/StatusPopover';
import ToggleButton from '../components/ui/ToggleButton';
import ToggleMode from '../components/ui/ToggleMode';
import Input from '../components/forms/Input';
import DropDown from '../components/forms/DropDown';
import GapInput from '../components/forms/GapInput';
import UploadImage from '../components/forms/UploadImage';
import { PiArchive, PiCheck, PiX } from 'react-icons/pi';
import './TestComponents.scss';

const TestComponents = () => {
  // State for various component demonstrations
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [activeAccordionIndex, setActiveAccordionIndex] = useState(false);
  const [activeCategories, setActiveCategories] = useState([false, true, false]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [filterChecked, setFilterChecked] = useState([false, true, false]);

  // Example data
  const filterOptions = [
    { name: 'Option 1', count: 12 },
    { name: 'Option 2', count: 8 },
    { name: 'Option 3', count: 5 }
  ];

  const cardOptions = [
    {
      title: 'Card Options',
      options: ['Option A', 'Option B', 'Option C']
    }
  ];

  const statusList = ['Pending', 'Processing', 'Completed', 'Cancelled'];

  // Toggle functions
  const handleToggle = () => setIsToggleOn(!isToggleOn);

  const handleAccordionClick = () => setActiveAccordionIndex(!activeAccordionIndex);

  const handleCategoryClick = (index) => {
    const newCategories = [...activeCategories];
    newCategories[index] = !newCategories[index];
    setActiveCategories(newCategories);
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  const handleCheckboxToggle = (index) => {
    const newChecked = [...filterChecked];
    newChecked[index] = !newChecked[index];
    setFilterChecked(newChecked);
  };

  return (
    <div className="test-components">
      <h1>Component Library Test</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {/* Basic UI Components Section */}
        <div className="component-section">
          <h2>Basic UI Components</h2>

          <h3>Toggle Button</h3>
          <ToggleButton isOn={isToggleOn} toggleButton={handleToggle} />

          <h3>Toggle Mode</h3>
          <ToggleMode modes={['Light', 'Dark']} />

          <h3>Star Rating</h3>
          <StarRating rating={4} />

          <h3>Categories</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Category
              isActive={activeCategories[0]}
              categName="Beverages"
              onClick={() => handleCategoryClick(0)}
            />
            <Category
              isActive={activeCategories[1]}
              categName="Food"
              onClick={() => handleCategoryClick(1)}
            />
            <Category
              isActive={activeCategories[2]}
              categName="Desserts"
              onClick={() => handleCategoryClick(2)}
            />
          </div>
        </div>

        {/* Form Components Section */}
        <div className="component-section">
          <h2>Form Components</h2>

          <h3>Input</h3>
          <Input
            value="Example input"
            onchange={() => {}}
            placeholder="Enter text..."
          />

          <h3>Dropdown</h3>
          <div style={{ height: '40px', position: 'relative' }}>
            <DropDown
              options={['Option 1', 'Option 2', 'Option 3']}
              defaultValue="Select option"
              isOpen={isDropdownOpen}
              setIsOpen={setIsDropdownOpen}
              toggleDropdown={toggleDropdown}
              handleOptionClick={handleOptionClick}
              selectedOption={selectedOption}
            />
          </div>

          <h3>GapInput</h3>
          <GapInput onChange={() => {}} />

          <h3>Upload Image</h3>
          <UploadImage
            img="https://via.placeholder.com/48"
            name="Product Image"
            onUpload={() => {}}
          />
        </div>

        {/* Complex Components Section */}
        <div className="component-section">
          <h2>Complex Components</h2>

          <h3>Card</h3>
          <Card options={cardOptions} setType={() => {}} />

          <h3>Accordion</h3>
          <div style={{ marginBottom: '20px' }}>
            <Accordion
              propertyName="Product Properties"
              activeIndex={activeAccordionIndex}
              handleClick={handleAccordionClick}
            >
              <div style={{ padding: '10px' }}>Accordion content goes here</div>
            </Accordion>
          </div>

          <h3>File</h3>
          <File
            fileName="product_specs.pdf"
            fileType="PDF"
            onDownloadFile={() => {}}
            onShowFile={() => {}}
          />
        </div>

        {/* Popover Components Section */}
        <div className="component-section">
          <h2>Popover Components</h2>

          <h3>Alert</h3>
          <div style={{ position: 'relative', height: '100px' }}>
            <Alert
              alertHeader="Confirm Action"
              alertMessage="Are you sure you want to proceed with this action?"
              alertIcon={<PiArchive />}
              theme="active"
              onConfirm={() => {}}
              onClose={() => {}}
            />
          </div>

          <h3>Filter</h3>
          <div style={{ position: 'relative', height: '200px' }}>
            <Filter
              options={filterOptions}
              isOn={isToggleOn}
              onToggle={handleToggle}
              checked={filterChecked}
              onCheck={handleCheckboxToggle}
              onSeletAll={() => {}}
              count={25}
            />
          </div>

          <h3>Status Popover</h3>
          <div style={{ position: 'relative', height: '150px' }}>
            <StatusPopover
              statusList={statusList}
              handleClickStatus={() => {}}
              orderStatus="pending"
            />
          </div>

          <h3>PopOver</h3>
          <div style={{ position: 'relative', height: '100px' }}>
            <PopOver>
              <div>
                <p>Select an option</p>
                <div>
                  <p>Custom popover content</p>
                </div>
              </div>
            </PopOver>
          </div>
        </div>

        {/* Image Component Section */}
        <div className="component-section">
          <h2>Image Component</h2>

          <Image
            img="https://via.placeholder.com/48"
            name="Product Image"
            onDelete={() => {}}
            isMain={true}
            onMakeMain={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default TestComponents;