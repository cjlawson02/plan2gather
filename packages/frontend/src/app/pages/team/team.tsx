import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';

export default function Team() {
  const teamMembers = [
    {
      name: 'Chris Lawson',
      major: '4th Year Computer Science',
      image: 'https://avatars.githubusercontent.com/u/7269141', // Add the path to your image, take github profile pics
      bio: "I'm a 4th-year Computer Science student and a Junior Software Developer at Amazon, where I work on full stack web applications. When I'm not coding, I'm likely to be found hiking, mountain biking, or skiing. At Plan2Gather, I'm excited to contribute to a platform that simplifies and enriches the way we plan and connect.",
    },
    {
      name: 'Naomi Nayman',
      major: '3rd Year Computer Science',
      image: 'https://avatars.githubusercontent.com/u/97060752',
      bio: "I'm from Chicago... blah blah...etc",
    },
    {
      name: 'Sam Bock',
      major: '3rd Year Computer Science',
      image: 'https://avatars.githubusercontent.com/u/63836618',
      bio: 'Insert a bio for yourself',
    },
    {
      name: 'Spencer Perley',
      major: '3rd Year Computer Science',
      image: 'https://avatars.githubusercontent.com/u/63747892',
      bio: 'Insert a bio for yourself',
    },
  ];

  return (
    <Container>
      <Typography component="h1" variant="h3" align="center" gutterBottom>
        Team
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {teamMembers.map((member) => (
          <Grid xs={12} sm={6} md={4} key={member.name}>
            <Avatar
              alt={member.name}
              src={member.image}
              sx={{ width: 150, height: 150, margin: 'auto' }}
            />
            <Typography variant="h5" align="center" gutterBottom>
              {member.name}
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              color="textSecondary"
              paragraph
            >
              {member.major}
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              {member.bio}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
