package org.pescuma.datatable;

import java.util.Collection;

import com.google.common.base.Function;
import com.google.common.base.Predicate;

public interface DataTable {
	
	int size();
	
	boolean isEmpty();
	
	void add(double value, String... info);
	
	void inc(double value, String... info);
	
	void add(DataTable other);
	
	void inc(DataTable other);
	
	Collection<Line> getLines();
	
	double get(String... info);
	
	Collection<String> getColumn(int column);
	
	/** @param columns null or empty to get all */
	Collection<String[]> getColumns(int... columns);
	
	Collection<String> getDistinct(int column);
	
	/** @param columns null or empty to get all */
	Collection<String[]> getDistinct(int... columns);
	
	/** @param columns null or empty to get all */
	DataTable groupBy(int... columns);
	
	DataTable filter(String... info);
	
	DataTable filter(int column, String value);
	
	DataTable filter(Predicate<Line> predicate);
	
	DataTable filter(int column, Predicate<String> predicate);
	
	DataTable map(int column, Function<String, String> transform);
	
	double sum();
	
	public interface Line {
		double getValue();
		
		String getColumn(int column);
		
		/** @param columns null or empty to get all */
		String[] getColumns(int... columns);
	}
}
