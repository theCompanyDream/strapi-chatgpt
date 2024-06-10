import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Typography, Box, Button, SingleSelect as Select, SingleSelectOption } from '@strapi/design-system';
import { auth } from '@strapi/helper-plugin';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

const voices = [
  "Alloy",
  "Echo",
  "Fable",
  "Onyx",
  "Nova",
  "Shimmer"
]

export default function SuperAudio({
  name,
  error,
  description,
  onChange,
  value,
  intlLabel,
  attribute,
}) {
  const { modifiedData } = useCMEditViewDataManager();
  const { formatMessage } = useIntl();
  const [selectedField, setSelectedField] = useState('');
  const [voice, setVoice] = useState(voices[0])
  const [err, setErr] = useState('');
  const [prompt, setPrompt] = useState('');

  const generateAudio = async (event) => {
    event.preventDefault(); // Prevent the default form submission
    if (!selectedField) {
      setErr('Please select a field.');
      return;
    }
    try {
      const response = await fetch(`/strapi-supergpt/generateAudio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.get('jwtToken')}`,
        },
        body: JSON.stringify({
          prompt: modifiedData[selectedField],
          voice: voice
        }),
      });

      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }

      const result = await response.json();
      const parsedResult = result.choices[0].text.replace(/(?:\r\n|\r|\n)/g, '');

      onChange({ target: { name, value: parsedResult, type: attribute.type } });
    } catch (err) {
      setErr(err.message);
    }
  };

  const clearGeneratedText = async (event) => {
    event.preventDefault(); // Prevent the default form submission
    onChange({ target: { name, value: '', type: attribute.type } });
  };

  return (
    <Box padding={4} spacing={2}>
      <Select
        label={formatMessage({id: "strapi-supergpt.customFields.super-audio.field.label"})}
        name="fieldSelector"
        onChange={setSelectedField}
        value={selectedField}
      >
        <SingleSelectOption value="">Select a field</SingleSelectOption>
        {Object.keys(modifiedData).map((field, idx) => (
          <SingleSelectOption key={idx} value={field}>
            {field}
          </SingleSelectOption>
        ))}
      </Select>
      <Select
        label={formatMessage({ id: "strapi-supergpt.customFields.super-audio.voice.label" })}
        name="voice"
        onChange={(value) => setVoice(value)}
        value={voice}
      >
        {voices.map((voice, index) => (
          <SingleSelectOption key={index} value={voice.toLowerCase()}>
            {voice}
          </SingleSelectOption>
        ))}
      </Select>
      {err && (
        <Typography variant="pi" textColor="danger700">
          {err}
        </Typography>
      )}
      <Box paddingTop={4}>
        <Box display="flex" justifyContent="space-between" paddingTop={4}>
          <Button onClick={(e) => generateAudio(e)}>Generate</Button>
          <Button onClick={(e) => clearGeneratedText(e)}>Clear</Button>
        </Box>
      </Box>
    </Box>
  );
}
