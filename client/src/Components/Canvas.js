import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./Canvas.css";

const Canvas = ({ color }) => {
    const [socket, setSocket] = useState();
    const [drawData, setDrawData] = useState(null);
    let timeout;

    useEffect(() => {
        const s = io("http://localhost:5000/");
        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket == null) return;
        socket.on("canvas-data", (data) => {
            setDrawData(data);
            let image = new Image();
            let canvas = document.querySelector("#canvas-sketch");
            let ctx = canvas.getContext("2d");
            image.onload = function (e) {
                ctx.drawImage(image, 0, 0);
            };
            image.src = data;
        })
    }, [socket])

    useEffect(() => {
        drawOnCanvas();
        if (drawData) {
            let image = new Image();
            let canvas = document.querySelector("#canvas-sketch");
            let ctx = canvas.getContext("2d");
            image.onload = function (e) {
                ctx.drawImage(image, 0, 0);
            };
            image.src = drawData;
        }
    }, [color]);

    useEffect(() => {
        if (socket == null || drawData == null) return;
        socket.emit("canvas-data", drawData);
    }, [drawData, socket])
    const drawOnCanvas = function () {
        let canvas = document.querySelector("#canvas-sketch");
        let ctx = canvas.getContext("2d");

        let sketch = document.querySelector(".canvas");
        let sketch_style = getComputedStyle(sketch);
        canvas.width = parseInt(sketch_style.getPropertyValue("width"));
        canvas.height = parseInt(sketch_style.getPropertyValue("height"));

        let mouse = { x: 0, y: 0 };
        let last_mouse = { x: 0, y: 0 };

        canvas.addEventListener(
            "mousemove",
            function (e) {
                last_mouse.x = mouse.x;
                last_mouse.y = mouse.y;

                mouse.x = e.pageX - this.offsetLeft;
                mouse.y = e.pageY - this.offsetTop;
            },
            false
        );

        ctx.linewidth = 5;
        ctx.strokeStyle = color;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        canvas.addEventListener(
            "mousedown",
            function (e) {
                canvas.addEventListener("mousemove", onPaint, false);
            },
            false
        );
        canvas.addEventListener(
            "mouseup",
            function (e) {
                canvas.removeEventListener("mousemove", onPaint, false);
            },
            false
        );

        const onPaint = function () {
            ctx.beginPath();
            ctx.moveTo(last_mouse.x, last_mouse.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.closePath();
            ctx.stroke();
            if (timeout !== undefined) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                let base64image = canvas.toDataURL("image/png");
                setDrawData(base64image);
            }, 1000);
        };
    };

    return (
        <div className="canvas">
            <canvas className="canvas-sketch" id="canvas-sketch" />
        </div>
    );
};

export default Canvas;
