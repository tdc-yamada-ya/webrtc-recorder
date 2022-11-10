import { Button, TextField, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import copy from "copy-to-clipboard";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { rtcConfig } from "./rtcConfig";

export const Sender = () => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [conn, setConn] = useState<RTCPeerConnection | null>(null);
  const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [offerStr, setOfferStr] = useState("");
  const [answer, setAnswer] = useState<RTCSessionDescriptionInit | null>(null);
  const [answerStr, setAnswerStr] = useState("");

  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setStream(stream);
    })();
  }, []);

  useEffect(() => {
    console.log("stream:", stream);
  }, [stream]);

  useEffect(() => {
    const videoElement = videoElementRef.current;

    if (!videoElement || !stream) return;

    videoElement.srcObject = stream;
    videoElement.volume = 0;
    videoElement.play();
  }, [stream]);

  useEffect(() => {
    if (!stream) return;

    const conn = new RTCPeerConnection(rtcConfig);

    conn.addEventListener("icecandidate", (e) => {
      console.log("onicecandidate:", e);

      const offer = conn.localDescription;
      if (offer) {
        setOffer(offer);
      }
    });

    conn.addEventListener("icecandidateerror", (e) => {
      console.log("onicecandidateerror:", e);
    });

    conn.addEventListener("track", (e) => {
      console.log("ontrack:", e);
    });

    conn.addEventListener("signalingstatechange", (e) => {
      console.log("onsignalingstatechange:", e);
    });

    const tracks = stream.getTracks();
    for (const track of tracks) {
      conn.addTrack(track);
    }

    setConn(conn);

    return () => {
      conn.close();
      setConn(null);
    };
  }, [stream]);

  useEffect(() => {
    console.log("conn:", conn);
  }, [conn]);

  useEffect(() => {
    if (!conn) return;

    (async () => {
      const offer = await conn.createOffer();
      await conn.setLocalDescription(offer);
      setOffer(offer);
    })();
  }, [conn]);

  useEffect(() => {
    console.log("offer:", offer);
    try {
      setOfferStr(JSON.stringify(offer));
    } catch {
      setOfferStr("");
    }
  }, [offer]);

  useEffect(() => {
    console.log("offerStr:", offerStr);
  }, [offerStr]);

  useEffect(() => {
    console.log("answerStr:", answerStr);

    try {
      setAnswer(JSON.parse(answerStr));
    } catch {
      setAnswer(null);
    }
  }, [answerStr]);

  useEffect(() => {
    console.log("answer:", answer);
  }, [answer]);

  useEffect(() => {
    if (!conn || !answer) return;

    (async () => {
      try {
        await conn.setRemoteDescription(answer);
      } catch (err) {
        console.warn("setRemoteDescription error:", err);
      }
    })();
  }, [conn, answer]);

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography>
          相手へ送信するカメラ映像が正しく映っていることを確認してください。
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
          手動シグナリングを開始します。以下の欄に表示された Offer
          をコピーしてください。
        </Typography>
        <Stack spacing={1}>
          <TextField
            label="Offer"
            multiline
            fullWidth
            value={offerStr}
            disabled
            maxRows={4}
          />
          <Stack direction="row">
            <Button
              variant="contained"
              onClick={() => {
                copy(offerStr);
              }}
            >
              コピー
            </Button>
          </Stack>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography>受信ページの指示通りに進めてください。</Typography>
      </Stack>
      <Stack spacing={1}>
        <Typography>
          受信ページの Answer を以下の欄に貼り付けてください。
        </Typography>
        <TextField
          label="Answer"
          multiline
          fullWidth
          value={answerStr}
          maxRows={4}
          onChange={(e) => setAnswerStr(e.target.value)}
        />
      </Stack>
      <Stack spacing={1}>
        <Typography>
          カメラ映像が正しく転送されていることを確認してください。
        </Typography>
      </Stack>
    </Stack>
  );
};
