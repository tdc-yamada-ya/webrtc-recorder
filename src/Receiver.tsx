import { useEffect, useRef, useState } from "react";
import { rtcConfig } from "./rtcConfig";
import { Button, TextField, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import copy from "copy-to-clipboard";

export const Receiver = () => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [conn, setConn] = useState<RTCPeerConnection | null>(null);
  const [offerStr, setOfferStr] = useState("");
  const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [answer, setAnswer] = useState<RTCSessionDescriptionInit | null>(null);
  const [answerStr, setAnswerStr] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [tracks, setTracks] = useState<MediaStreamTrack[]>([]);
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const conn = new RTCPeerConnection(rtcConfig);

    conn.addEventListener("icecandidate", (e) => {
      console.log("onicecandidate:", e);
      const offer = conn.localDescription;
      if (offer) {
        setAnswerStr(JSON.stringify(offer));
      }
    });

    conn.addEventListener("icecandidateerror", (e) => {
      console.log("onicecandidateerror:", e);
    });

    conn.addEventListener("track", (e) => {
      console.log("ontrack:", e);
      const track = e.track;
      if (track) {
        setTracks((tracks) => [...tracks, track]);
      }
    });

    conn.addEventListener("signalingstatechange", (e) => {
      console.log("onsignalingstatechange:", e);
    });

    setConn(conn);

    return () => {
      conn.close();
      setConn(null);
      setTracks([]);
      setStream(null);
    };
  }, []);

  useEffect(() => {
    console.log("offerStr:", offerStr);

    try {
      setOffer(JSON.parse(offerStr));
    } catch {
      setOffer(null);
    }
  }, [offerStr]);

  useEffect(() => {
    console.log("offer:", offer);
  }, [offer]);

  useEffect(() => {
    if (!conn || !offer) return;

    (async () => {
      try {
        await conn.setRemoteDescription(offer);
      } catch (err) {
        console.warn("setRemoteDescription error:", err);
      }
      const answer = await conn.createAnswer();
      await conn.setLocalDescription(answer);
      setAnswer(answer);
    })();
  }, [conn, offer]);

  useEffect(() => {
    console.log("answer:", answer);
    try {
      setAnswerStr(JSON.stringify(answer));
    } catch {
      setAnswerStr("");
    }
  }, [answer]);

  useEffect(() => {
    console.log("answerStr:", answerStr);
  }, [answerStr]);

  useEffect(() => {
    console.log("tracks:", tracks);

    const stream = new MediaStream(tracks);
    setStream(stream);
  }, [tracks]);

  useEffect(() => {
    console.log("stream:", stream);
  }, [stream]);

  useEffect(() => {
    const videoElement = videoElementRef.current;

    if (!videoElement || !stream) return;

    videoElement.srcObject = stream;
    videoElement.volume = 0;

    (async () => {
      try {
        await videoElement.play();
      } catch (err) {
        console.warn("play error:", err);
      }
    })();
  }, [stream]);

  const startRecording = () => {
    if (
      recorderRef.current ||
      !stream ||
      stream.getVideoTracks().length === 0
    ) {
      return;
    }

    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.addEventListener("dataavailable", (e) => {
      chunks.push(e.data);
    });
    recorder.addEventListener("start", () => {
      setRecording(true);
    });
    recorder.addEventListener("stop", () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
      setRecording(false);
    });
    recorder.start(1000);

    recorderRef.current = recorder;
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;

    if (!recorder) return;

    recorder.stop();

    recorderRef.current = null;
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography>
          送信側でコピーした Offer を以下の欄に貼り付けてください。
        </Typography>
        <TextField
          label="Offer"
          multiline
          fullWidth
          value={offerStr}
          maxRows={4}
          onChange={(e) => setOfferStr(e.target.value)}
        />
      </Stack>
      <Stack spacing={1}>
        <Typography>
          以下の欄に表示された Answer をコピーしてください。
        </Typography>
        <Stack spacing={1}>
          <TextField
            label="Answer"
            multiline
            fullWidth
            value={answerStr}
            disabled
            maxRows={4}
          />
          <Stack direction="row">
            <Button
              variant="contained"
              onClick={() => {
                copy(answerStr);
              }}
            >
              コピー
            </Button>
          </Stack>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography>
          送信ページの Answer 欄にコピーした文字列を貼り付けてください。
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Typography>
          カメラ映像を正しく受信していることを確認してください。
        </Typography>
        <Stack direction="row" alignItems="center">
          <video
            ref={videoElementRef}
            style={{ maxWidth: "16rem", minHeight: "8rem" }}
            autoPlay
            playsInline
            muted
          />
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography>
          以下のボタンを押してレコーディングを開始してください。
        </Typography>
        <Stack direction="row">
          <Button variant="contained" onClick={() => startRecording()}>
            レコーディング開始
          </Button>
        </Stack>
        {recording ? <Typography>レコーディング中</Typography> : null}
      </Stack>
      <Stack spacing={1}>
        <Typography>
          以下のボタンを押してレコーディングを停止してください。
        </Typography>
        <Stack direction="row">
          <Button variant="contained" onClick={() => stopRecording()}>
            レコーディング停止
          </Button>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography>
          以下のボタンを押してファイルをダウンロードしてください。
        </Typography>
        <Stack direction="row">
          <a href={videoURL} download="video.webm">
            Download
          </a>
        </Stack>
      </Stack>
    </Stack>
  );
};
