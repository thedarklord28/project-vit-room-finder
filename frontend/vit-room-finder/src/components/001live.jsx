import React, { useState, useEffect } from 'react'
import classData from "../../rawdata/rooms.json"
import slotData from "../../rawdata/slotTimings.json"

export default function Live() {
    const [activeTheorySlot, setActiveTheorySlot] = useState(null);
    const [activeLabSlot, setActiveLabSlot] = useState(null);

    const [curDay, setCurDay] = useState('');
    const [curTime, setCurTime] = useState('');
    const [allFreeRooms, setAllFreeRooms] = useState(null);

    const [hideOccupied, setHideOccupied] = useState(false);
    const [isCustomTime, setIsCustomTime] = useState(false);

    const BLOCKS = [...new Set(
        Object.values(classData.rooms).map(r => r.block).filter(Boolean)
    )].sort();




    useEffect(() => {
        if (isCustomTime) return;

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
    }, [isCustomTime]);


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

    const allByBlock = Object.entries(classData.rooms || {}).reduce((acc, [venue, details]) => {
        const block = details.block;
        if (!block) return acc;

        if (!acc[block]) acc[block] = { 'theory': [], 'lab': [] };

        const isLab = details.occupied_slots[0].slot.includes('L')

        if (isLab) {
            acc[block].lab.push(venue);
        } else {
            acc[block].theory.push(venue);
        }

        return acc;
    }, {});

    const freeByBlock = (allFreeRooms || []).reduce((acc, [venue, details]) => {
        const block = details.block;
        if (!block) return acc;

        if (!acc[block]) acc[block] = { 'theory': [], 'lab': [] };

        if (details.occupied_slots[0].slot.includes('L'))
            acc[block].lab.push(venue);
        else
            acc[block].theory.push(venue);
        return acc;
    }, {})

    return (

        <div className='w-full h-screen flex flex-col bg-[#FFF6EA] overflow-hidden '>
            <div className='w-full flex flex-shrink-0 mx-auto max-w-7xl p-6 py-5 gap-3 justify-between items-center'>
                <h1 className='text-2xl px-10 pl-0'>RoomFree</h1>

                <div className='flex flex-wrap items-center gap-2'>
                    <div className='flex gap-2 tracking-tight leading-none text-2xl'>
                        {isCustomTime ? (
                            <>
                                <select
                                    value={curDay}
                                    onChange={e => setCurDay(e.target.value)}
                                    className='bg-transparent text-2xl'
                                >
                                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <input
                                    type="time"
                                    value={curTime}
                                    onChange={e => setCurTime(e.target.value)}
                                    className='bg-transparent text-2xl'
                                />
                            </>
                        ) : (
                            <>
                                <h1>{curDay}</h1>
                                <h1>{curTime}</h1>
                            </>
                        )}
                    </div>

                    <div className="hidden sm:block h-8 w-[2px] bg-gray-900/30" />

                    <div className='text-right text-sm leading-tight items-center'>
                        <h1>{`Theory Slot: ${activeTheorySlot ? activeTheorySlot : 'None'}`}</h1>
                        <h1>{`Lab Slot: ${activeLabSlot ? activeLabSlot : 'None'}`}</h1>
                    </div>
                </div>

                <button
                    onClick={() => setIsCustomTime(prev => !prev)}
                    className='text-sm px-3 py-1 rounded-full border border-gray-900/20'
                >
                    {isCustomTime ? 'Back to live' : 'Custom time'}
                </button>
            </div>

            <div className="w-full h-[1px] bg-gray-900/20" />

            <div className='w-full flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>



                <div className='max-w-7xl mx-auto w-full'>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={hideOccupied}
                            onChange={(e) => setHideOccupied(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className={`relative w-9 h-5 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-soft dark:peer-focus:ring-brand-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand 
                            ${hideOccupied ?
                                'bg-[#93C572]' :
                                'bg-red-400'
                            }`}></div>
                        <span className="select-none ms-3 text-sm font-medium text-heading">Hide Occupied Classrooms</span>
                    </label>

                    {BLOCKS.map(block => {
                        const blockData = freeByBlock[block] || { theory: [], lab: [] };
                        const allBlockData = allByBlock[block] || { theory: [], lab: [] };
                        const allTheory = allBlockData.theory;
                        const allLab = allBlockData.lab;
                        const theoryRooms = blockData.theory;
                        const labRooms = blockData.lab;
                        const totalFreeCount = theoryRooms.length + labRooms.length;

                        return (
                            <div key={block} className='w-full'>
                                <div className='flex gap-2 items-center justify-between mb-4 px-2'>
                                    <h1 className='text-xl'>{block}</h1>
                                    <p>{theoryRooms.length + labRooms.length} free</p>
                                </div>
                                <div>
                                    <div>
                                        <h1 className='text-l mb-2'>Theory</h1>
                                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 mb-4 w-full">
                                            {(hideOccupied || allTheory.length === 0) && theoryRooms.length === 0 ? (
                                                <div className='bg-red-400 p-3 py-3 rounded-3xl flex items-center justify-center text-center'>
                                                    <p>None</p>
                                                </div>
                                            ) :
                                                (
                                                    <>
                                                        {
                                                            theoryRooms.map(theory => (
                                                                <div className='bg-[#93C572] p-3 py-3 rounded-3xl flex items-center justify-center text-center' >
                                                                    <p key={theory}>{theory}</p>
                                                                </div>
                                                            ))}

                                                        {!hideOccupied &&
                                                            allTheory.filter(t => !theoryRooms.includes(t)).map(theory => (
                                                                <div key={theory} className='bg-red-400 p-3 py-3 rounded-3xl flex items-center justify-center text-center'>
                                                                    <p>{theory}</p>
                                                                </div>
                                                            ))}

                                                    </>
                                                )
                                            }
                                        </div>
                                    </div>

                                    <div>
                                        <h1 className='text-l mb-2'>Lab</h1>
                                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 mb-4 w-full">
                                            {(hideOccupied || allLab.length === 0) && labRooms.length === 0 ? (
                                                <div className='bg-red-400 p-3 py-3 rounded-3xl flex items-center justify-center text-center'>
                                                    <p>None</p>
                                                </div>
                                            ) :
                                                (
                                                    <>
                                                        {
                                                            labRooms.map(lab => (
                                                                <div className='bg-[#93C572] p-3 py-3 rounded-3xl flex items-center justify-center text-center' >
                                                                    <p key={lab}>{lab}</p>
                                                                </div>
                                                            ))}

                                                        {!hideOccupied &&
                                                            allLab.filter(t => !labRooms.includes(t)).map(lab => (
                                                                <div key={lab} className='bg-red-400 p-3 py-3 rounded-3xl flex items-center justify-center text-center'>
                                                                    <p>{lab}</p>
                                                                </div>
                                                            ))}

                                                    </>

                                                )
                                            }

                                        </div>
                                    </div>


                                    <div className="w-full h-[1px] bg-gray-900/20 mb-3" />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div >
    )
}
