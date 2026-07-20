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

    const BLOCKS = [...new Set(
        Object.values(classData.rooms).map(r => r.block).filter(Boolean)
    )].sort();

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

    const freeByBlock = (allFreeRooms || []).reduce((acc, [venue, details]) => {
        const block = details.block;
        if (!block) return acc;
        if (!acc[block]) acc[block] = [];
        acc[block].push(venue);
        return acc;
    }, {})

    return (

        <div className='w-full h-screen flex flex-col bg-[#FFF6EA] overflow-hidden '>
            <div className='w-full flex flex-shrink-0 mx-auto max-w-7xl p-6 py-5 gap-3 justify-between items-center'>
                <h1 className='text-xl px-10 pl-0'>RoomFree</h1>

                <div className='flex flex-wrap items-center gap-2'>
                    <div className='flex gap-2 tracking-tight leading-none text-2xl'>
                        <h1>{curDay}</h1>
                        <h1>{curTime}</h1>
                    </div>

                    <div className="hidden sm:block h-8 w-[2px] bg-gray-900/30" />

                    <div className='text-right text-sm leading-tight items-center'>
                        <h1>{`Theory Slot: ${activeTheorySlot ? activeTheorySlot : 'None'}`}</h1>
                        <h1>{`Lab Slot: ${activeLabSlot ? activeLabSlot : 'None'}`}</h1>
                    </div>
                </div>
            </div>

            <div className="w-full h-[1px] bg-gray-900/20" />

            <div className='w-full flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                <div className='max-w-7xl mx-auto w-full'>
                    {BLOCKS.map(block => {
                        const rooms = freeByBlock[block] || [];
                        return (
                            <div key={block} className='w-full'>
                                <div className='flex gap-2 items-center justify-between mb-4 px-2'>
                                    <h1 className='text-xl'>{block}</h1>
                                    <p>{rooms.length} free</p>
                                </div>
                                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 mb-4 w-full">
                                    {
                                        rooms.map(room => {
                                            return (
                                                <div className='bg-[#93C572] p-3 py-3 rounded-3xl flex items-center justify-center text-center'>
                                                    <p key={room}>{room}</p>
                                                </div>
                                            )

                                        }
                                        )
                                    }
                                </div>
                                <div className="w-full h-[1px] bg-gray-900/20 mb-3" />
                            </div>
                        )
                    })
                    }
                </div>
            </div>
        </div>
    )
}
