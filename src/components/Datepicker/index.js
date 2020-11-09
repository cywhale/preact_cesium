//https://github.com/arqex/react-datetime
//https://github.com/arqex/react-datetime/issues/105
//https://github.com/NateRadebaugh/react-datetime/
import { useState } from 'preact/hooks';
//import "react-datetime/css/react-datetime.css";
//import Datetime from "react-datetime";
//import DateTime from "@nateradebaugh/react-datetime";
//import "@nateradebaugh/react-datetime/scss/styles.scss";
//import moment from "moment";

const Datepicker = () => {
  const formatYmd = date => date.toISOString().slice(0, 10); //2020-01-01T00:00:00
  const formatTime= date => date.toISOString().slice(11,19);
  const today = formatYmd(new Date());
  const currt = formatTime(new Date());

  const [datetime, setDatetime] = useState({
    startdate: today,
    starttime: '00:00:00',
    enddate: today,
    endtime: currt
  })

  const startt = new Date(datetime.startdate+'T'+datetime.starttime);
  const endt = new Date(datetime.enddate+'T'+datetime.endtime);
  console.log("Start time now: ", startt);
  console.log("End time now: ", endt);

/*
  const myrenderView = (mode, renderDefault) => {
    // Only for years, months and days view
    if (mode === "time") return renderDefault();
        <div className="controls">
          <button onClick={() => this.goToToday()}>Today</button>
        </div>
    return (
      <div class="wrapper">
        {renderDefault()}
      </div>
    );
  }

  let inputProps1 = {
    placeholder: 'Start date-time',
    //disabled: true,
    //onMouseLeave: () => alert('')
  };
    <Datetime inputProps={ inputProps1 }
              onChange={(val) => {console.log("Start time now: ", val.format("YYYY-MM-DD HH:mm:ss"))}}
              onClose={(val) => {setStart(val.format("YYYY-MM-DD HH:mm:ss"))}} /> */
/*const setStart = async (dtime) => {
    console.log("Start time is: ", dtime);
    await setDatetime((preState) => ({
        ...preState,
        start: dtime,
    }));
  };

  const setEnd = async (dtime) => {
    console.log("End time is: ", dtime);
    await setDatetime((preState) => ({
        ...preState,
        end: dtime,
    }));
  };
      <DateTime dateFormat="yyyy-LL-dd" timeFormat="HH:mm:ss"
        renderView={(mode, renderDefault) =>
          myrenderView(mode, renderDefault)
        } onChange={(val) => {setStart(val)}} />
      <DateTime dateFormat="yyyy-LL-dd" timeFormat="HH:mm:ss"
        renderView={(mode, renderDefault) =>
          myrenderView(mode, renderDefault)
        } onChange={(val) => {setEnd(val)}} />*/
  return(
    <div style="display:block;">
      <div style="display:flex;justify-content:center;flex-direction:column;">
        <input style="margin: .4rem 0;" id="startdate" name="startdate" type="date" id="date" value={datetime.startdate}
               onChange={(e) => {setDatetime((preState) => ({
                 ...preState,
                 startdate: e.target.value,
               }))}} />
        <input style="margin: .4rem 0;" type="time" id="startime" name="starttime" min="00:00:00" max="23:59:59" step={1}
               value={datetime.starttime}
               onChange={(e) => {setDatetime((preState) => ({
                 ...preState,
                 starttime: e.target.value,
               }))}} />
      </div>
      <div style="display:flex;justify-content:center;flex-direction:column;">
        <input style="margin: .4rem 0;" id="enddate" name="enddate" type="date" id="date" value={datetime.enddate}
               onChange={(e) => {setDatetime((preState) => ({
                 ...preState,
                 enddate: e.target.value,
               }))}} />
        <input style="margin: .4rem 0;" type="time" id="endtime" name="endtime" min="00:00:00" max="23:59:59" step={1}
               value={datetime.endtime}
               onChange={(e) => {setDatetime((preState) => ({
                 ...preState,
                 endtime: e.target.value,
               }))}} />
      </div>
    </div>
  );
};
export default Datepicker;
