import { Global } from "@emotion/react";
import { Typography } from "@mui/material";
import { Box, Container, Stack } from "@mui/system";
import { Fragment } from "react";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { Receiver } from "./Receiver";
import { Sender } from "./Sender";

const Selector = () => {
  return (
    <Stack spacing={2}>
      <Typography>
        下記のリンクを押してテストページを開いてください。
      </Typography>
      <Stack spacing={1}>
        <Box>
          <Typography>
            <Link to="/sender">送信ページを開く</Link>
          </Typography>
        </Box>
        <Box>
          <Typography>
            <Link to="/receiver">受信ページを開く</Link>
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Selector />,
  },
  {
    path: "/sender",
    element: <Sender />,
  },
  {
    path: "/receiver",
    element: <Receiver />,
  },
]);

export const App = () => {
  return (
    <Fragment>
      <Global
        styles={{
          body: {
            margin: 0,
          },
        }}
      />
      <Box sx={{ m: 1 }}>
        <Container>
          <Stack spacing={2}>
            <Typography variant="h5">WebRTC Recorder</Typography>
            <Typography>
              WebRTC の録画が行えることを確認するテストプログラムです。
              このプログラムは送信側と受信側に分かれてテストを行います。
            </Typography>
            <RouterProvider router={router} />
          </Stack>
        </Container>
      </Box>
    </Fragment>
  );
};
