package vttp.batch5.groupb.project.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import vttp.batch5.groupb.project.model.Quote;

@Repository
public interface QuoteRepository extends CrudRepository<Quote, String> {
} 