import React, { CSSProperties, useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';

import { useTranslation } from 'gatsby-plugin-react-i18next';

import './Pagination.sass';

export const Pagination = <T,>({
  data,
  itemsPerPage = 4,
  renderItem,
  keyExtractor,
  className,
  style,
  navHidden,
}: {
  data: T[];
  itemsPerPage?: number;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  className?: string;
  style?: CSSProperties;
  navHidden?: boolean;
}) => {
  const [currentItems, setCurrentItems] = useState<T[] | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemOffset, setItemOffset] = useState<number>(0);

  const { t } = useTranslation();

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(data.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(data.length / itemsPerPage));
  }, [itemOffset, itemsPerPage]);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % data.length;
    setItemOffset(newOffset);
  };

  return (
    <>
      <div className={className} style={style}>
        {currentItems &&
          currentItems.map(item => (
            <React.Fragment key={keyExtractor(item)}>
              {renderItem(item)}
            </React.Fragment>
          ))}
      </div>
      {navHidden || (
        <ReactPaginate
          nextAriaLabel={t('pagination.nextAriaLabel')}
          previousAriaLabel={t('pagination.previousAriaLabel')}
          ariaLabelBuilder={i => t('pagination.ariaLabelBuilder', { page: i })}
          breakAriaLabels={{
            forward: t('pagination.breakAriaLabels.forward'),
            backward: t('pagination.breakAriaLabels.backward'),
          }}
          nextLabel={t('pagination.nextLabel')}
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          marginPagesDisplayed={2}
          pageCount={pageCount}
          previousLabel={t('pagination.previousLabel')}
          pageClassName="pagination__page"
          pageLinkClassName="page-link"
          previousClassName=""
          previousLinkClassName="pagination__nav prev"
          nextClassName=""
          nextLinkClassName="pagination__nav next"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination reactpaginate"
          activeClassName="is-current"
        />
      )}
    </>
  );
};
