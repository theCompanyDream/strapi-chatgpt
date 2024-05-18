import React, { useState } from 'react';
import {
  Box,
  Typography,
  SimpleMenu,
  MenuItem,
  Tab
} from '@strapi/design-system';
import { More } from '@strapi/icons';

const CustomTab = ({ children, onRename, onDelete, ...props }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [name, setName] = useState(children);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRename = () => {
    const newName = prompt('Enter new tab name:', name);
    if (newName) {
      setName(newName);
      onRename(newName);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this tab?')) {
      onDelete();
    }
    handleClose();
  };

  return (
    <Tab {...props}>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Typography variant="omega">{name}</Typography>
        <Box alignItems="right">
          <SimpleMenu label={<More />} onClick={handleClick} anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={handleRename}>Rename</MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </SimpleMenu>
        </Box>
      </Box>
    </Tab>
  );
};

export default CustomTab;
