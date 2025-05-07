import React, { useState } from 'react';
import { Row, Col, InputGroup, FormControl, Button, Dropdown } from 'react-bootstrap';
import { FaPlus, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { colors } from '../../theme/theme';

interface DeviceToolbarProps {
  onSearch: (query: string) => void;
  onAddDevice: () => void;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sortField: string, sortDirection: 'asc' | 'desc') => void;
  filterOptions?: {
    label: string;
    value: string;
  }[];
  sortOptions?: {
    label: string;
    value: string;
  }[];
}

const DeviceToolbar: React.FC<DeviceToolbarProps> = ({
  onSearch,
  onAddDevice,
  onFilterChange,
  onSortChange,
  filterOptions = [
    { label: 'All Devices', value: 'all' },
    { label: 'Online', value: 'online' },
    { label: 'Offline', value: 'offline' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
  ],
  sortOptions = [
    { label: 'Name', value: 'name' },
    { label: 'Status', value: 'status' },
    { label: 'Last Seen', value: 'lastSeen' },
  ],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState(filterOptions[0]);
  const [currentSort, setCurrentSort] = useState(sortOptions[0]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (filter: any) => {
    setCurrentFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter.value);
    }
  };

  const handleSortChange = (sort: any) => {
    setCurrentSort(sort);
    if (onSortChange) {
      onSortChange(sort.value, sortDirection);
    }
  };

  const toggleSortDirection = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    if (onSortChange) {
      onSortChange(currentSort.value, newDirection);
    }
  };

  return (
    <div className="device-toolbar mb-4">
      <Row className="align-items-center">
        <Col xs={12} md={6} lg={4} className="mb-3 mb-lg-0">
          <InputGroup>
            <InputGroup.Text id="search-addon">
              <FaSearch color={colors.neutral.darkGray} />
            </InputGroup.Text>
            <FormControl
              placeholder="Search devices..."
              aria-label="Search devices"
              aria-describedby="search-addon"
              value={searchQuery}
              onChange={handleSearch}
            />
          </InputGroup>
        </Col>
        
        <Col xs={12} md={6} lg={8}>
          <div className="d-flex justify-content-md-end gap-2 flex-wrap">
            {onFilterChange && (
              <Dropdown className="me-2">
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-filter" className="d-flex align-items-center">
                  <FaFilter className="me-2" />
                  <span>{currentFilter.label}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {filterOptions.map((option) => (
                    <Dropdown.Item 
                      key={option.value}
                      onClick={() => handleFilterChange(option)}
                      active={currentFilter.value === option.value}
                    >
                      {option.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
            
            {onSortChange && (
              <div className="d-flex">
                <Dropdown className="me-2">
                  <Dropdown.Toggle variant="outline-secondary" id="dropdown-sort" className="d-flex align-items-center">
                    <span>Sort by: {currentSort.label}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {sortOptions.map((option) => (
                      <Dropdown.Item 
                        key={option.value}
                        onClick={() => handleSortChange(option)}
                        active={currentSort.value === option.value}
                      >
                        {option.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={toggleSortDirection}
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? 
                    <FaSortAmountUp /> : 
                    <FaSortAmountDown />
                  }
                </Button>
              </div>
            )}
            
            <Button 
              variant="primary" 
              className="ms-2 px-3 d-flex align-items-center" 
              onClick={onAddDevice}
            >
              <FaPlus className="me-2" />
              Add Device
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DeviceToolbar;
