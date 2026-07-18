#!/usr/bin/env python3
"""Build the narrated 120-second ReCo-Splat presentation video."""

from __future__ import annotations

import json
import math
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STORYBOARD = ROOT / "video" / "storyboard.json"
WORK = ROOT / "video" / "work"
SEGMENTS = WORK / "segments"
AUDIO = WORK / "audio"
OUTPUT = ROOT / "output"
FONT = "/System/Library/Fonts/Helvetica.ttc"
FPS = 30
WIDTH = 1920
HEIGHT = 1080
VOICE = "Samantha"


def run(command: list[str]) -> None:
    print("+", " ".join(command[:8]), "...", flush=True)
    subprocess.run(command, cwd=ROOT, check=True)


def probe_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "stream=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    values = [line.strip() for line in result.stdout.splitlines() if line.strip() not in {"", "N/A"}]
    return float(values[0]) if values else 0.0


def ffmpeg_time(seconds: float) -> str:
    millis = int(round(seconds * 1000))
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def escape_drawtext(value: str) -> str:
    return value.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")


def title_chain(title: str, duration: float) -> str:
    safe = escape_drawtext(title)
    fade_out = max(0.0, duration - 0.35)
    return (
        "drawbox=x=60:y=106:w=120:h=5:color=0xEF5B45:t=fill,"
        f"drawtext=fontfile='{FONT}':text='{safe}':fontsize=48:fontcolor=0x17202A:"
        "x=60:y=34,"
        "fade=t=in:st=0:d=0.35:color=0xF4F6F8,"
        f"fade=t=out:st={fade_out:.3f}:d=0.35:color=0xF4F6F8"
    )


def encode_args(target: Path, duration: float) -> list[str]:
    return [
        "-t",
        f"{duration:.3f}",
        "-r",
        str(FPS),
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "19",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(target),
    ]


def image_segment(scene: dict, target: Path) -> None:
    duration = float(scene["duration"])
    asset = ROOT / scene["asset"]
    chain = (
        "scale=1800:850:force_original_aspect_ratio=decrease:force_divisible_by=2,"
        "pad=1920:1080:(ow-iw)/2:(oh-ih)/2+45:color=0xF4F6F8,setsar=1,"
        + title_chain(scene["title"], duration)
    )
    run(
        ["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-framerate", str(FPS), "-i", str(asset), "-vf", chain]
        + encode_args(target, duration)
    )


def pair_chain(title: str, duration: float, labels: tuple[str, str]) -> str:
    left_label = escape_drawtext(labels[0])
    right_label = escape_drawtext(labels[1])
    base = (
        "[0:v]scale=880:700:force_original_aspect_ratio=decrease:force_divisible_by=2,"
        "pad=880:700:(ow-iw)/2:(oh-ih)/2:color=0x111A22,setsar=1[left];"
        "[1:v]scale=880:700:force_original_aspect_ratio=decrease:force_divisible_by=2,"
        "pad=880:700:(ow-iw)/2:(oh-ih)/2:color=0x111A22,setsar=1[right];"
        "[left][right]hstack=inputs=2[stack];"
        "[stack]pad=1920:1080:80:210:color=0xF4F6F8,"
        f"drawtext=fontfile='{FONT}':text='{left_label}':fontsize=28:fontcolor=white:"
        "box=1:boxcolor=0x111A22@0.88:boxborderw=10:x=100:y=172,"
        f"drawtext=fontfile='{FONT}':text='{right_label}':fontsize=28:fontcolor=white:"
        "box=1:boxcolor=0x111A22@0.88:boxborderw=10:x=1000:y=172,"
        + title_chain(title, duration)
        + "[out]"
    )
    return base


def image_pair_segment(scene: dict, target: Path) -> None:
    duration = float(scene["duration"])
    command = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-loop",
        "1",
        "-framerate",
        str(FPS),
        "-i",
        str(ROOT / scene["left"]),
        "-loop",
        "1",
        "-framerate",
        str(FPS),
        "-i",
        str(ROOT / scene["right"]),
        "-filter_complex",
        pair_chain(scene["title"], duration, ("Rendered RGB", "Gaussian distribution")),
        "-map",
        "[out]",
    ] + encode_args(target, duration)
    run(command)


def video_pair_segment(scene: dict, target: Path) -> None:
    duration = float(scene["duration"])
    chain = pair_chain(scene["title"], duration, ("Rendered RGB", "Predicted depth"))
    command = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-ss",
        "2",
        "-i",
        str(ROOT / scene["left"]),
        "-ss",
        "2",
        "-i",
        str(ROOT / scene["right"]),
        "-filter_complex",
        chain,
        "-map",
        "[out]",
    ] + encode_args(target, duration)
    run(command)


def video_triple_segment(scene: dict, target: Path) -> None:
    duration = float(scene["duration"])
    inputs: list[str] = []
    for asset in scene["assets"]:
        inputs += ["-i", str(ROOT / asset)]
    chain = (
        "[0:v]setpts=2*(PTS-STARTPTS),fps=30,scale=800:450:force_original_aspect_ratio=decrease,"
        "pad=800:450:(ow-iw)/2:(oh-ih)/2:color=0x111A22,setsar=1[a];"
        "[1:v]setpts=2*(PTS-STARTPTS),fps=30,scale=800:450:force_original_aspect_ratio=decrease,"
        "pad=800:450:(ow-iw)/2:(oh-ih)/2:color=0x111A22,setsar=1[b];"
        "[2:v]setpts=2*(PTS-STARTPTS),fps=30,scale=800:450:force_original_aspect_ratio=decrease,"
        "pad=800:450:(ow-iw)/2:(oh-ih)/2:color=0x111A22,setsar=1[c];"
        "[a][b]hstack=inputs=2[top];"
        "[c]pad=1600:450:400:0:color=0xF4F6F8[bottom];"
        "[top][bottom]vstack=inputs=2[grid];"
        "[grid]pad=1920:1080:160:145:color=0xF4F6F8,"
        f"drawtext=fontfile='{FONT}':text='DA3':fontsize=27:fontcolor=white:box=1:boxcolor=0x111A22@0.88:boxborderw=9:x=180:y=160,"
        f"drawtext=fontfile='{FONT}':text='WorldMirror':fontsize=27:fontcolor=white:box=1:boxcolor=0x111A22@0.88:boxborderw=9:x=980:y=160,"
        f"drawtext=fontfile='{FONT}':text='ReCo-Splat':fontsize=27:fontcolor=white:box=1:boxcolor=0xEF5B45@0.92:boxborderw=9:x=580:y=610,"
        + title_chain(scene["title"], duration)
        + "[out]"
    )
    run(
        ["ffmpeg", "-y", "-loglevel", "error"]
        + inputs
        + ["-filter_complex", chain, "-map", "[out]"]
        + encode_args(target, duration)
    )


def image_grid_segment(scene: dict, target: Path) -> None:
    duration = float(scene["duration"])
    inputs: list[str] = []
    for asset in scene["assets"]:
        inputs += ["-loop", "1", "-framerate", str(FPS), "-i", str(ROOT / asset)]
    filters = []
    for index in range(4):
        filters.append(
            f"[{index}:v]scale=720:470:force_original_aspect_ratio=decrease:force_divisible_by=2,"
            f"pad=720:470:(ow-iw)/2:(oh-ih)/2:color=0x111A22,setsar=1[g{index}]"
        )
    chain = (
        ";".join(filters)
        + ";[g0][g1]hstack=inputs=2[top];[g2][g3]hstack=inputs=2[bottom];"
        "[top][bottom]vstack=inputs=2[grid];"
        "[grid]pad=1920:1080:240:125:color=0xF4F6F8,"
        f"drawtext=fontfile='{FONT}':text='RGB reference':fontsize=25:fontcolor=white:box=1:boxcolor=0x111A22@0.88:boxborderw=8:x=260:y=140,"
        f"drawtext=fontfile='{FONT}':text='DA3':fontsize=25:fontcolor=white:box=1:boxcolor=0x111A22@0.88:boxborderw=8:x=980:y=140,"
        f"drawtext=fontfile='{FONT}':text='WorldMirror':fontsize=25:fontcolor=white:box=1:boxcolor=0x111A22@0.88:boxborderw=8:x=260:y=610,"
        f"drawtext=fontfile='{FONT}':text='ReCo-Splat':fontsize=25:fontcolor=white:box=1:boxcolor=0xEF5B45@0.92:boxborderw=8:x=980:y=610,"
        + title_chain(scene["title"], duration)
        + "[out]"
    )
    run(
        ["ffmpeg", "-y", "-loglevel", "error"]
        + inputs
        + ["-filter_complex", chain, "-map", "[out]"]
        + encode_args(target, duration)
    )


def make_segment(scene: dict, target: Path) -> None:
    kind = scene["kind"]
    if kind == "image":
        image_segment(scene, target)
    elif kind == "image_pair":
        image_pair_segment(scene, target)
    elif kind == "video_pair":
        video_pair_segment(scene, target)
    elif kind == "video_triple":
        video_triple_segment(scene, target)
    elif kind == "image_grid":
        image_grid_segment(scene, target)
    else:
        raise ValueError(f"Unsupported scene kind: {kind}")


def make_voice(scene: dict, target: Path) -> None:
    duration = float(scene["duration"])
    aiff = target.with_suffix(".aiff")
    rate = 180
    for _ in range(3):
        run(["say", "-v", VOICE, "-r", str(rate), "-o", str(aiff), scene["narration"]])
        spoken = probe_duration(aiff)
        if spoken <= duration - 0.35:
            break
        rate = min(260, math.ceil(rate * spoken / (duration - 0.45)) + 5)
    if probe_duration(aiff) > duration:
        raise RuntimeError(f"Narration is too long for {scene['id']}")
    run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(aiff),
            "-af",
            f"apad=pad_dur={duration:.3f}",
            "-t",
            f"{duration:.3f}",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "pcm_s16le",
            str(target),
        ]
    )


def write_concat(paths: list[Path], target: Path) -> None:
    lines = [f"file '{path.as_posix()}'" for path in paths]
    target.write_text("\n".join(lines) + "\n")


def write_srt(scenes: list[dict], target: Path) -> None:
    cursor = 0.0
    blocks = []
    for index, scene in enumerate(scenes, start=1):
        end = cursor + float(scene["duration"])
        blocks.append(
            f"{index}\n{ffmpeg_time(cursor)} --> {ffmpeg_time(end)}\n{scene['narration']}\n"
        )
        cursor = end
    target.write_text("\n".join(blocks), encoding="utf-8")


def main() -> None:
    scenes = json.loads(STORYBOARD.read_text(encoding="utf-8"))
    total = sum(float(scene["duration"]) for scene in scenes)
    if abs(total - 120.0) > 0.001:
        raise RuntimeError(f"Storyboard must total 120 seconds, got {total}")

    if WORK.exists():
        shutil.rmtree(WORK)
    SEGMENTS.mkdir(parents=True)
    AUDIO.mkdir(parents=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)

    video_paths: list[Path] = []
    audio_paths: list[Path] = []
    for index, scene in enumerate(scenes, start=1):
        print(f"[{index:02d}/{len(scenes):02d}] {scene['title']}", flush=True)
        video_path = SEGMENTS / f"{index:02d}_{scene['id']}.mp4"
        audio_path = AUDIO / f"{index:02d}_{scene['id']}.wav"
        make_segment(scene, video_path)
        make_voice(scene, audio_path)
        video_paths.append(video_path)
        audio_paths.append(audio_path)

    video_list = WORK / "video_concat.txt"
    audio_list = WORK / "audio_concat.txt"
    write_concat(video_paths, video_list)
    write_concat(audio_paths, audio_list)

    silent_video = WORK / "reco_splat_silent.mp4"
    narration_audio = WORK / "reco_splat_narration.wav"
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(video_list), "-c", "copy", str(silent_video)])
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(audio_list), "-c:a", "pcm_s16le", str(narration_audio)])

    srt = OUTPUT / "reco-splat_2min_demo_en.srt"
    write_srt(scenes, srt)
    final = OUTPUT / "reco-splat_2min_demo_en.mp4"
    subtitle_filter = (
        f"subtitles=filename='{srt.as_posix()}':fontsdir='/System/Library/Fonts':"
        "force_style='FontName=Helvetica,FontSize=12,PrimaryColour=&H00FFFFFF,"
        "OutlineColour=&H70000000,BackColour=&H90000000,BorderStyle=3,Outline=1,"
        "Shadow=0,MarginV=22,Alignment=2'"
    )
    run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(silent_video),
            "-i",
            str(narration_audio),
            "-vf",
            subtitle_filter,
            "-af",
            "loudnorm=I=-16:TP=-1.5:LRA=11",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "19",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-t",
            "120",
            "-movflags",
            "+faststart",
            str(final),
        ]
    )
    print(f"DONE: {final}", flush=True)


if __name__ == "__main__":
    main()
