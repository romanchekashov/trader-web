import moment = require("moment");
import * as React from "react";
import { filterSecurities } from "../../../common/utils/DataUtils";
import { DATE_TIME_FORMAT } from "../../../common/utils/utils";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectSecurities } from "../securitiesSlice";
import { SecuritiesFilter } from "./filter/SecuritiesFilter";
import "./Securities.css";
import SecuritiesTable from "./table/SecuritiesTable";

type Props = {};

const Securities: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { securities, selectedSecurityTypeWrapper } =
    useAppSelector(selectSecurities);

  const securitiesFiltered = filterSecurities(
    securities,
    selectedSecurityTypeWrapper
  );
  const lastTimeUpdate = moment(new Date()).format(DATE_TIME_FORMAT);

  return (
    <>
      <SecuritiesFilter lastTimeUpdate={lastTimeUpdate} />
      <SecuritiesTable securities={securitiesFiltered} />
    </>
  );
};

export default Securities;
