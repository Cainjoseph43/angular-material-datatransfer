import { Injectable } from '@angular/core';
import { DatatransferStore } from '../stores';
import { IDatatransferItem, IPaginationContainer, PaginationContainer } from '../models';

import { _ } from 'underscore';

@Injectable()
export class PaginationService {

    public pagination: IPaginationContainer;
    public paginatedItems: IDatatransferItem[] = [];

    constructor(private datatransferStore: DatatransferStore) {
        this.pagination = new PaginationContainer();
    }

    setRppOptions(rppOptions): void {
        this.pagination.rppOptions = rppOptions;
        this.setPaginationContainer();
    }

    update(total: number): void {
        if (total <= 0) {
            this.paginatedItems.length = 0;
        }
        this.pagination.total = total;
        this.setPaginationContainer();
    }

    setPaginationContainer(): void {
        let pageCount: number = this.pageCount();
        if (this.pagination.pages.length > pageCount) {
            this.pagination.pages.splice(pageCount);
        } else {
            for (let i = this.pagination.pages.length; i < pageCount; i++) {
                this.pagination.pages.push(i + 1);
            }
        }
        if (!_.contains(this.pagination.pages, this.pagination.page)) {
            this.pagination.page = 1;
        }
        if (!!this.pagination.rppOptions && this.pagination.rppOptions.length > 0
            && !_.contains(this.pagination.rppOptions, this.pagination.rpp)) {
            this.pagination.rpp = this.pagination.rppOptions[0];
        }
        this.onPaginationChange();
    }

    max(): number {
        return this.hasNext() ? this.pagination.page * this.pagination.rpp : this.pagination.total;
    };

    min(): number {
        return this.pagination.total > 0 ? this.pagination.page * this.pagination.rpp - this.pagination.rpp + 1 : 0;
    };

    first(): void {
        this.pagination.page = 1;
        this.onPaginationChange();
    }

    last(): void {
        this.pagination.page = this.pageCount();
        this.onPaginationChange();
    }

    hasNext(): boolean {
        return this.pagination.page * this.pagination.rpp < this.pagination.total;
    }

    hasPrevious(): boolean {
        return this.pagination.page > 1;
    };

    moveNext(): void {
        this.pagination.page++;
        this.onPaginationChange();
    }

    movePrevious(): void {
        this.pagination.page--;
        this.onPaginationChange();
    }

    setPage(page: number) {
        this.pagination.page = page;
        this.onPageChange();
    }

    onPageChange(): void {
        this.setPaginationContainer();
        this.onPaginationChange();
    }

    onRppChange(): void {
        this.setPaginationContainer();
        this.pagination.page = 1;
        this.onPaginationChange();
    }

    onPaginationChange(): void {
        let startIndex = (this.pagination.page - 1) * this.pagination.rpp;
        let endIndex = Math.min(startIndex + this.pagination.rpp, this.pagination.total);
        this.paginatedItems = this.datatransferStore.getItems().slice(startIndex, endIndex);
    }

    pageCount(): number {
        return this.pagination.total > 0 ? Math.ceil(this.pagination.total / (this.pagination.rpp > 0 ? this.pagination.rpp : 1)) : 1;
    }

    getPageByItemId(id: string): number {
        let index: number = this.datatransferStore.getIndexById(id);
        if (index > -1) {
            return Math.ceil((index + 1) / this.pagination.rpp);
        }
    }

    setPageByItemId(id: string): void {
        let page = this.getPageByItemId(id);
        if (this.pagination.page !== page) {
            this.setPage(page);
        }
    }
}
