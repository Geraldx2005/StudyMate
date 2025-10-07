import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InputFileUpload from '../file/InputFileUpload';
import { storage } from '../../firebase';
import { ref, listAll } from 'firebase/storage';

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
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#152a59',
            borderWidth: '2px',
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
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#152a59',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#152a59',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#152a59',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#152a59',
            borderWidth: '2px',
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
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subjectInputValue, setSubjectInputValue] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Reset subject when department, year, or semester changes
    if (name !== 'sub') {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
        sub: ''
      }));
      setSubjectInputValue('');
    }
  };

  const handleSubjectChange = (event, newValue) => {
    setFormData(prevState => ({
      ...prevState,
      sub: newValue || ''
    }));
  };

  const handleSubjectInputChange = (event, newInputValue) => {
    setSubjectInputValue(newInputValue);
    // Also update the form data when user types (for free text entry)
    if (newInputValue && !subjects.includes(newInputValue)) {
      setFormData(prevState => ({
        ...prevState,
        sub: newInputValue
      }));
    }
  };

  // Fetch subjects from Firebase when department, year, or semester changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!formData.dept || !formData.year || !formData.sem) {
        setSubjects([]);
        return;
      }

      setLoading(true);
      try {
        const path = `${formData.dept}/${formData.year}/${formData.sem}`;
        const storageRef = ref(storage, path);
        
        const result = await listAll(storageRef);
        
        // Extract folder names (subjects) from the prefixes
        const subjectList = result.prefixes.map(prefix => {
          // Get the last part of the path which is the subject name
          const fullPath = prefix.fullPath;
          const pathParts = fullPath.split('/');
          return pathParts[pathParts.length - 1];
        });

        setSubjects(subjectList);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [formData.dept, formData.year, formData.sem]);

  return (
    <ThemeProvider theme={theme}>
      <div className="w-full border-2 border-[#152a59] rounded-2xl flex flex-col items-center justify-between px-4 py-6 space-y-6 bg-white">
        <h1 className="text-2xl font-bold text-[#152a59] mb-4">Upload your files here</h1>
        
        <Box sx={{ minWidth: 250, width: '100%', maxWidth: 300 }}>
          <FormControl fullWidth required>
            <InputLabel id="dept-select-label">Department</InputLabel>
            <Select
              labelId="dept-select-label"
              id="dept"
              name="dept"
              value={formData.dept}
              label="Department *"
              onChange={handleChange}
              required
            >
              <MenuItem value="cse">Computer Science</MenuItem>
              <MenuItem value="ece">Electronics & Communication</MenuItem>
              <MenuItem value="mech">Mechanical</MenuItem>
              <MenuItem value="elec">Electrical</MenuItem>
              <MenuItem value="civil">Civil</MenuItem>
              <MenuItem value="it">IT</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 250, width: '100%', maxWidth: 300 }}>
          <FormControl fullWidth required>
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select
              labelId="year-select-label"
              id="year"
              name="year"
              value={formData.year}
              label="Year *"
              onChange={handleChange}
              required
            >
              <MenuItem value="first">1st Year</MenuItem>
              <MenuItem value="second">2nd Year</MenuItem>
              <MenuItem value="third">3rd Year</MenuItem>
              <MenuItem value="fourth">4th Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 250, width: '100%', maxWidth: 300 }}>
          <FormControl fullWidth required>
            <InputLabel id="sem-select-label">Semester</InputLabel>
            <Select
              labelId="sem-select-label"
              id="sem"
              name="sem"
              value={formData.sem}
              label="Semester *"
              onChange={handleChange}
              required
            >
              <MenuItem value="odd">Odd</MenuItem>
              <MenuItem value="even">Even</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 250, width: '100%', maxWidth: 300 }}>
          <FormControl fullWidth required>
            <Autocomplete
              freeSolo
              disablePortal
              id="sub-autocomplete"
              options={subjects}
              loading={loading}
              value={formData.sub}
              inputValue={subjectInputValue}
              onInputChange={handleSubjectInputChange}
              onChange={handleSubjectChange}
              disabled={!formData.dept || !formData.year || !formData.sem}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Subject" 
                />
              )}
              sx={{
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#152a59',
                },
              }}
            />
          </FormControl>
        </Box>

        {/* Pass the form data to InputFileUpload component */}
        <InputFileUpload formData={formData} />
      </div>
    </ThemeProvider>
  );
}

export default FileUploadCtrl;