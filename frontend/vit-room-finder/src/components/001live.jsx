import React, { useState, useEffect } from 'react'
import classData from "../../rawdata/rooms.json"
import slotData from "../../rawdata/slotTimings.json"

export default function Live() {
    const [activeTheorySlot, setActiveTheorySlot] = useState(null);
    const [activeLabSlot, setActiveLabSlot] = useState(null);

    const [curDay, setCurDay] = useState('');
    const [curTime, setCurTime] = useState('');
    const [allFreeRooms, setAllFreeRooms] = useState(null);
    const [freeTheoryRooms, setFreeTheoryRooms] = useState(null);
    const [freeLabRooms, setFreeLabRooms] = useState(null);

    //test var rem later
    const [ab1, setAb1] = useState(null);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            const currentDay = days[now.getDay()];
            const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            //const currentTimeStr = '08:30';
            setCurDay(currentDay);
            //setCurDay('Friday');
            setCurTime(currentTimeStr);
        };

        updateClock();

        const timerId = setInterval(updateClock, 1000);

        return () => clearInterval(timerId);
    }, []);


    useEffect(() => {

        if (curDay && curTime) {
            const todaysSchedule = slotData[curDay] || { theory: [], lab: [] };
            const currTheory = todaysSchedule.theory.find(t => curTime >= t.start && curTime <= t.end);
            const currLab = todaysSchedule.lab.find(l => curTime >= l.start && curTime <= l.end);
            const currTheorySlot = currTheory ? currTheory.slot : null;
            const currLabSlot = currLab ? currLab.slot : null;

            const freeRooms = Object.entries(classData.rooms)
                .filter(([venue, details]) => {
                    const isOccupied = details.occupied_slots.some(booking => {
                        const slotParts = booking.slot.split('+').map(s => s.trim());
                        return slotParts.includes(currTheorySlot) || slotParts.includes(currLabSlot);
                    })
                    return !isOccupied
                })



            setActiveTheorySlot(currTheorySlot);
            setActiveLabSlot(currLabSlot);
            setAllFreeRooms(freeRooms)
        }
    }, [curDay, curTime])

    return (
        <div className='w-screen h-full flex flex-col justify-between bg-[#FFF6EA]'>
            <div className='w-full flex p-6 py-5 gap-3 justify-between items-center'>
                <h1 className='text-xl px-10'>RoomFree</h1>

                <div className='flex items-center gap-2'>
                    <div className='flex gap-2 tracking-tight leading-none text-2xl'>
                        <h1>{curDay}</h1>
                        <h1>{curTime}</h1>
                    </div>

                    <div className="h-8 w-[2px] bg-gray-900/50" />

                    <div className='text-right text-sm leading-tight items-center'>
                        <h1>{`Theory Slot: ${activeTheorySlot ? activeTheorySlot : 'None'}`}</h1>
                        <h1>{`Lab Slot: ${activeLabSlot ? activeLabSlot : 'None'}`}</h1>
                    </div>
                </div>
            </div>

            <div className="w-full h-[1px] bg-gray-900/20 mb-3" />

            <div>
                {allFreeRooms && allFreeRooms.map(([venue, details]) => {
                    return (
                        <p key={venue}>{venue}</p>
                    )
                })}
            </div>
        </div>
    )
}
