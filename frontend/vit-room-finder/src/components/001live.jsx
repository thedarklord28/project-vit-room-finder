import React, { useState, useEffect } from 'react'
import classData from "../../rawdata/mockffcs.json"
import slotData from "../../rawdata/slotTimings.json"

export default function Live() {
    const [freeTheory, setFreeTheory] = useState(null);
    const [freeLab, setFreeLab] = useState(null);
    const [freeByBlock, setFreeByBlock]=useState({});
    
    

    useEffect(() => {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const currentDay = days[1];
        const currentTimeStr = '08:30';

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

        const freeTheoryRooms = [...new Set(freeTheorySlots.map(item => String(item.VENUE)||""))].sort()
        const freeLabRooms = [...new Set(freeLabSlots.map(item => String(item.VENUE)||""))].sort()

        setFreeTheory(freeTheoryRooms);
        setFreeLab(freeLabRooms);

        const blocks = ['AB1', 'AB2', 'AB3', 'AB4', 'AB5', 'ADB', 'MAB3', 'MAB4'];
        const blocksMapping = {};

        blocks.forEach(block=>{
            blocksMapping[block]={
                theory: freeTheoryRooms.filter(room=>room && room.includes(block)),
                lab: freeLabRooms.filter(room=>room && room.includes(block))
            }
        },[])

        setFreeByBlock(blocksMapping);

        
    })
    return (
        <div>
            {console.log(freeByBlock['AB1'])}
        </div>
    )
}
