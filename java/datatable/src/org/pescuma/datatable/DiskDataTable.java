package org.pescuma.datatable;

import java.io.File;
import java.util.Collection;
import java.util.List;

import org.pescuma.datatable.func.Function2;

import com.google.common.base.Function;
import com.google.common.base.Predicate;

public class DiskDataTable implements DataTable {
	
	private final File file;
	private final DataTable data;
	private boolean loadedFromDisk = false;
	private boolean wroteData = false;
	
	public DiskDataTable(File file, DataTable data) {
		this.file = file;
		this.data = data;
	}
	
	public void saveToDisk() {
		if (!wroteData)
			return;
		
		DataTableSerialization.saveAsCSV(this, file, !loadedFromDisk);
	}
	
	private void loadFromDisk() {
		if (loadedFromDisk)
			return;
		loadedFromDisk = true;
		
		if (!file.exists())
			return;
		
		DataTableSerialization.loadFromCSV(this, file);
	}
	
	@Override
	public int count() {
		loadFromDisk();
		return data.count();
	}
	
	@Override
	public boolean isEmpty() {
		loadFromDisk();
		return data.isEmpty();
	}
	
	@Override
	public void add(double value, String... info) {
		wroteData = true;
		data.add(value, info);
	}
	
	@Override
	public void inc(double value, String... info) {
		loadFromDisk();
		wroteData = true;
		data.inc(value, info);
	}
	
	@Override
	public void add(DataTable other) {
		if (other.isEmpty())
			return;
		
		wroteData = true;
		data.add(other);
	}
	
	@Override
	public void inc(DataTable other) {
		if (other.isEmpty())
			return;
		
		loadFromDisk();
		wroteData = true;
		data.inc(other);
	}
	
	@Override
	public double get(String... info) {
		loadFromDisk();
		return data.get(info);
	}
	
	@Override
	public Collection<Line> getLines() {
		loadFromDisk();
		return data.getLines();
	}
	
	@Override
	public Collection<String> getDistinct(int column) {
		loadFromDisk();
		return data.getDistinct(column);
	}
	
	@Override
	public Collection<String[]> getDistinct(int... columns) {
		loadFromDisk();
		return data.getDistinct(columns);
	}
	
	@Override
	public DataTable groupBy(int... columns) {
		loadFromDisk();
		return data.groupBy(columns);
	}
	
	@Override
	public DataTable filter(String... info) {
		loadFromDisk();
		return data.filter(info);
	}
	
	@Override
	public DataTable filter(int column, String value) {
		loadFromDisk();
		return data.filter(column, value);
	}
	
	@Override
	public DataTable filter(Predicate<Line> predicate) {
		loadFromDisk();
		return data.filter(predicate);
	}
	
	@Override
	public DataTable filter(int column, Predicate<String> predicate) {
		loadFromDisk();
		return data.filter(column, predicate);
	}
	
	@Override
	public DataTable mapColumn(int column, Function<String, String> transform) {
		loadFromDisk();
		return data.mapColumn(column, transform);
	}
	
	@Override
	public DataTable mapColumn(int column, Function2<String, String, Line> transform) {
		loadFromDisk();
		return data.mapColumn(column, transform);
	}
	
	@Override
	public <T> List<T> map(Function<Line, T> transform) {
		loadFromDisk();
		return data.map(transform);
	}
	
	@Override
	public double sum() {
		loadFromDisk();
		return data.sum();
	}
	
	@Override
	public Collection<String> getColumn(int column) {
		loadFromDisk();
		return data.getColumn(column);
	}
	
	@Override
	public Collection<String[]> getColumns(int... columns) {
		loadFromDisk();
		return data.getColumns(columns);
	}
	
}
