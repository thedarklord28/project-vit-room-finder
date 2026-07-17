import React, { useState, useEffect } from 'react'
import classData from "../../rawdata/mockffcs.json"
import slotData from "../../rawdata/slotTimings.json"

export default function Live() {
    const [freeTheory, setFreeTheory] = useState(null);
    const [freeLab, setFreeLab] = useState(null);
    const [freeByBlock, setFreeByBlock] = useState({});
    const [curDay, setCurDay] = useState('');
    const [curTime, setCurTime] = useState('');
    //test var rem later
    const [ab3, setAb3]=useState(null);


    useEffect(() => {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const currentDay = days[now.getDay()];
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        //const currentTimeStr = "08:30";
        if (currentDay)
            setCurDay(currentDay);
        if (currentTimeStr)
            setCurTime(currentTimeStr);

        if (currentDay && currentTimeStr) {
            const todaysSchedule = slotData[currentDay] || { theory: [], lab: [] };
            const currTheory = todaysSchedule.theory.find(t => currentTimeStr >= t.start && currentTimeStr <= t.end);
            const currLab = todaysSchedule.lab.find(l => currentTimeStr >= l.start && currentTimeStr <= l.end);
            const currTheorySlot = currTheory ? currTheory.slot : null;
            const currLabSlot = currLab ? currLab.slot : null;

            const freeRoomsSlots = classData.filter(item => {
                const itemSlots = item.SLOT.split('+');
                const isTheoryOccupied = currTheorySlot && itemSlots.includes(currTheorySlot);
                const isLabOccupied = currLabSlot && itemSlots.includes(currLabSlot);

                return !(isTheoryOccupied || isLabOccupied);

            });

            const freeTheorySlots = freeRoomsSlots.filter(item => {
                return !(item.SLOT.includes('L'))
            })

            const freeLabSlots = freeRoomsSlots.filter(item => {
                return (item.SLOT.includes('L'))
            })

            const freeTheoryRooms = [...new Set(freeTheorySlots.map(item => String(item.VENUE) || ""))].sort()
            const freeLabRooms = [...new Set(freeLabSlots.map(item => String(item.VENUE) || ""))].sort()

            setFreeTheory(freeTheoryRooms);
            setFreeLab(freeLabRooms);

            const blocks = ['AB1', 'AB2', 'AB3', 'AB4', 'AB5', 'ADB', 'MAB3', 'MAB4'];
            const blocksMapping = {};

            blocks.forEach(block => {
                blocksMapping[block] = {
                    theory: freeTheoryRooms.filter(room => room && room.includes(block)),
                    lab: freeLabRooms.filter(room => room && room.includes(block))
                }
            }, [])

            setFreeByBlock(blocksMapping);
            setAb3(blocksMapping['AB3']);
        }


    })

    return (
        <div className='w-screen h-screen flex flex-col justify-between'>
            <div className='w-full '>
                <h1>Live Room View</h1>
                <h1>{curDay}</h1>
                <h1>{curTime}</h1>
            </div>
            <div>
                {ab3 && ab3['theory'].map((room)=>{
                    return(
                        <p>{room}</p>
                    )
                })}
            </div>
        </div>
    )
}
