import React, { useState } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InputFileUpload from '../file/InputFileUpload';

// Create a custom theme with the specified color
const theme = createTheme({
  palette: {
    primary: {
      main: '#152a59',
    },
  },
  components: {
    MuiSelect: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#152a59',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#152a59',
          },
        },
      },
    },
  },
});

function FileUploadCtrl() {
  const [formData, setFormData] = useState({
    dept: '',
    year: '',
    sem: '',
    sub: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Function to get the form data that can be passed to InputFileUpload
  const getFormData = () => {
    return formData;
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="w-full border-2 border-[#152a59] rounded-2xl flex flex-col items-center justify-between px-4 py-6 space-y-6 bg-white">
        <h1 className="text-2xl font-bold text-[#152a59] mb-4">Upload your files here</h1>
        
        <Box sx={{ minWidth: 250, width: '100%', maxWidth: 300 }}>
          <FormControl fullWidth>
            <InputLabel id="dept-select-label">Department</InputLabel>
            <Select
              labelId="dept-select-label"
              id="dept"
              name="dept"
              value={formData.dept}
              label="Department"
              onChange={handleChange}
            >
              <MenuItem value="cse">Computer Science</MenuItem>
              <MenuItem value="mech">Mechanical</MenuItem>
              <MenuItem value="elec">Electrical</MenuItem>
              <MenuItem value="civil">Civil</MenuItem>
              <MenuItem value="it">IT</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 250, width: '100%', maxWidth: 300 }}>
          <FormControl fullWidth>
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select
              labelId="year-select-label"
              id="year"
              name="year"
              value={formData.year}
              label="Year"
              onChange={handleChange}
            >
              <MenuItem value="first">1st Year</MenuItem>
              <MenuItem value="second">2nd Year</MenuItem>
              <MenuItem value="third">3rd Year</MenuItem>
              <MenuItem value="fourth">4th Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 250, width: '100%', maxWidth: 300 }}>
          <FormControl fullWidth>
            <InputLabel id="sem-select-label">Semester</InputLabel>
            <Select
              labelId="sem-select-label"
              id="sem"
              name="sem"
              value={formData.sem}
              label="Semester"
              onChange={handleChange}
            >
              <MenuItem value="odd">Odd</MenuItem>
              <MenuItem value="even">Even</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 250, width: '100%', maxWidth: 300 }}>
          <FormControl fullWidth>
            <InputLabel id="sub-select-label">Subject</InputLabel>
            <Select
              labelId="sub-select-label"
              id="sub"
              name="sub"
              value={formData.sub}
              label="Subject"
              onChange={handleChange}
            >
              <MenuItem value="Chemistry">Chemistry</MenuItem>
              <MenuItem value="ds">Data Structures</MenuItem>
              <MenuItem value="dbms">DBMS</MenuItem>
              <MenuItem value="os">Operating Systems</MenuItem>
              <MenuItem value="cn">Computer Networks</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Pass the form data to InputFileUpload component */}
        <InputFileUpload formData={formData} />
      </div>
    </ThemeProvider>
  );
}

export default FileUploadCtrl;