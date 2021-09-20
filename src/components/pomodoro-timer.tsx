import React, { useEffect, useState, useCallback } from 'react';
import { useInterval } from '../hooks/use-interval';
import { secondsToTime } from '../utils/seconds.to-time';
import { Button } from './button';
import { Timer } from './timer';

const bellStart = require('../sounds/bell-start.mp3');
const bellFinish = require('../sounds/bell-finish.mp3');

const audioStartWorking = new Audio(bellStart);
const audioFinishWorking = new Audio(bellFinish);

interface Props {
    pomodoroTime: number;
    shortRestTime: number;
    longRestTime: number;
    cycles: number;
};

export function PomodoroTimer(props: Props): JSX.Element {
    const [mainTime, setMainTime] = useState(props.pomodoroTime);
    const [timeCounting, setTimeCounting] = useState(false);
    const [working, setWorking] = useState(false);
    const [resting, setResting] = useState(false);
    const [cyclesAmount, setCyclesAmount] = useState(new Array(props.cycles - 1).fill(true));
    const [completedCycles, setCompletedCycles] = useState(0);
    const [fullWorkingTime, setFullWorkingTime] = useState(0);
    const [pomodorosAmount, setPomodorosAmount] = useState(0);

    useInterval(() => {
        setMainTime(mainTime - 1);
        if (working) setFullWorkingTime(fullWorkingTime + 1);
    }, timeCounting ? 1000 : null);

    const configureWork = useCallback(() => {
        setTimeCounting(true);
        setWorking(true);
        setResting(false);
        setMainTime(props.pomodoroTime);
        audioStartWorking.play();
    }, [setTimeCounting, setWorking, setResting, setMainTime, props.pomodoroTime]);

    const configureRest = useCallback((long: boolean) => {
        setTimeCounting(true);
        setWorking(false);
        setResting(true);

        if (long) {
            setMainTime(props.longRestTime);
        } else {
            setMainTime(props.shortRestTime);
        }
        audioFinishWorking.play();
    }, [setTimeCounting, setWorking, setResting, setMainTime, props.longRestTime, props.shortRestTime]);

    useEffect(() => {
        if (working) document.body.classList.add('working');
        if (resting) document.body.classList.remove('working');
        if (mainTime > 0) return;
        if (working && cyclesAmount.length > 0) {
            configureRest(false);
            cyclesAmount.pop();
        } else if (working && cyclesAmount.length <= 0) {
            configureRest(true);
            setCyclesAmount(new Array(props.cycles - 1).fill(true));
            setCompletedCycles(completedCycles + 1);
        }
        if (working) setPomodorosAmount(pomodorosAmount + 1);
        if (resting) configureWork();
    }, [working, resting, mainTime, completedCycles, cyclesAmount, pomodorosAmount, configureRest, configureWork, setCompletedCycles, props.cycles]);

    return (
        <div className="pomodoro">
            <h2>You Are: {working ? 'Working' : 'Resting'}</h2>
            <Timer mainTime={mainTime} />

            <div className="controls">
                <Button text="Work" onclick={() => configureWork()}></Button>
                <Button text="Rest" onclick={() => configureRest(false)}></Button>
                <Button className={!working && !resting ? 'hidden' : ''} text={timeCounting ? 'Pause' : 'Play'} onclick={() => setTimeCounting(!timeCounting)}></Button>
            </div>

            <div className="details">
                <p>Completed Pomodoros: {pomodorosAmount}</p>
                <p>Worked Hours: {secondsToTime(fullWorkingTime)}</p>
                <p>Completed Cycles: {completedCycles}</p>
            </div>
        </div>
    );
};