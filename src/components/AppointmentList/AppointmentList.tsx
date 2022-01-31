import debounce from 'lodash.debounce';
import { useCallback, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectLastUpdatedTimestamp } from 'store/appointments';
// ---- External Imports ----

import config from 'config';
import { Table } from './Table';
// ---- Local imports ----

export type ItemType = {
  patient: string;
  practitioner: string;
  startDate: string;
  endDate: string;
};

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

const DEFAULT_PAGE_SIZE = 10;

const getQuery = (
  skip,
  searchTerm = null,
  filterBy = null,
  pageSize = null,
) => {
  pageSize = pageSize ?? DEFAULT_PAGE_SIZE;
  const query = `${SERVER_API_ENDPOINT}/appointments?pageSize=${pageSize}&&skip=${skip}&&searchTerm=${searchTerm}&&filterBy=${filterBy}`;
  return query;
};

const AppointmentList = () => {
  const appointmentsLastUpdatedTimestamp = useSelector((state) =>
    selectLastUpdatedTimestamp(state),
  );
  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [searchTerm, setSearchTerm] = useState(null);
  const [filterBy, setFilterBy] = useState(null);
  const [scrollState, setScrollState] = useState({
    rowIndex: 0,
    columnIndex: 0,
  });

  useEffect(() => {
    async function fetchLatest() {
      const response = await fetch(getQuery(skip, searchTerm, filterBy, -1));
      const parsedResponse = await response.json();
      setItems(parsedResponse.appointments.concat(items));
    }
    fetchLatest();
  }, [appointmentsLastUpdatedTimestamp]);

  useEffect(() => {
    setSkip(items.length);
  }, [items]);

  const setScrollRowAndColum = useCallback(
    (rowIndex: number, columnIndex: number) => {
      setScrollState({ rowIndex, columnIndex });
    },
    [],
  );

  const handleOnSearchInputChange = (e) => {
    e.preventDefault();
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    loadMoreItems();
  };

  const handleOnFilterByChange = (e) => {
    const filterBy = e.target.value;
    setFilterBy(filterBy);
  };

  const onResetFilter = () => {
    setSkip(0);
    setItems([]);
    setHasNextPage(true);
    setSearchTerm(null);
    setFilterBy(null);
  };

  const loadMoreItems = debounce(
    (startIndex: number, stopIndex: number): Promise<any> => {
      return fetch(getQuery(skip, searchTerm, filterBy))
        .then((res) => res.json())
        .then((response) => {
          const { appointments, appointmentsCount } = response;
          const newItems = items.concat(appointments);
          if (searchTerm && filterBy) {
            setItems(appointments);
          } else {
            setItems(newItems);
          }
          const newSkip = items.length;
          setHasNextPage(appointmentsCount > newSkip);
        });
    },
    300,
  );

  const isItemLoaded = (index: number) => !hasNextPage || !!items[index];

  return (
    <>
      <h3>Appointment List</h3>
      <form>
        <label>
          Name:
          <input
            type="text"
            value={searchTerm}
            onChange={handleOnSearchInputChange}
          />
        </label>
        <div>
          <label>
            Filter By:
            <input
              type="radio"
              value="practitioner"
              checked={filterBy === 'practitioner'}
              onChange={handleOnFilterByChange}
            />
            Practitioner
            <input
              type="radio"
              value="patient"
              checked={filterBy === 'patient'}
              onChange={handleOnFilterByChange}
            />
            Patient
          </label>
        </div>
        <input
          type="button"
          value="Reset"
          name="reset"
          onClick={onResetFilter}
        />
      </form>
      <Table
        hasNextPage={hasNextPage}
        items={items}
        loadMoreItems={loadMoreItems}
        isItemLoaded={isItemLoaded}
        scrollState={scrollState}
        setScrollRowAndColumn={setScrollRowAndColum}
      />
    </>
  );
};

export default AppointmentList;
