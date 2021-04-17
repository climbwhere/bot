import axios from "axios";
import moment from "moment";
import groupBy from "lodash/groupBy";
import keys from "lodash/keys";
import sortBy from "lodash/sortBy";

let slotCacheDate;
let slotCache;

const getSlots = async () => {
  if (slotCache !== undefined) {
    const cacheAge = moment().diff(slotCacheDate, "minutes");
    if (cacheAge < 2) {
      return slotCache;
    }
  }
  const slotData = await axios
    .get(
      "https://triomic.github.io/climbing-gym-scraper/sessions.json?rnd=" +
        Math.random()
    )
    .then(({ data }) => data);
  slotCache = { ...slotData };
  slotCacheDate = moment();
  return slotData;
};

export const getGyms = async () => {
  const slots = await getSlots();
  return keys(groupBy(slots.data, "gym"));
};

export const querySlots = async ({ gym, date = moment() }) => {
  const slots = await getSlots();
  return formatSlots(
    slots.data.filter(
      (slot) => slot.gym === gym && moment(slot.start).diff(date, "days") < 1
    ),
    gym
  );
};

const formatSlots = (slots, gym) => {
  return `Here are the slots for *${gym.replace(
    /[-[\]{}()*+?.,\\^$|#\s]/g,
    "\\$&"
  )}* for the next 24 hours:\n${sortBy(slots, "start")
    .map(
      (slot) =>
        `\`${moment(slot.start).format("ddd DD-MMM hh:mmA")} to ${moment(
          slot.end
        ).format("hh:mmA")}:  ${slot.spaces}\``
    )
    .join("\n")}`;
};
